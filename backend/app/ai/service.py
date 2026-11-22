"""
Gemini AI Service Orchestrator.
Manages Google GenAI client, structured generation, caching, single-flight deduplication,
and error mapping.
"""
import asyncio
import datetime
import hashlib
import json
import logging
import re
import time
from typing import Any, Dict, List, Optional, Tuple

from app.config import settings
from app.ai.context_builder import build_environmental_context
from app.ai.prompt_builder import (
    SYSTEM_INSTRUCTION,
    build_recommendation_prompt,
    build_chat_prompt
)
from app.ai.validator import validate_and_filter_ai_recommendations

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self, client: Optional[Any] = None):
        self._client = client
        self._cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
        self._cache_ttl_seconds = 600  # 10 minutes
        self._in_flight: Dict[str, asyncio.Future] = {}
        # In-memory IP rate limiter: {ip: [timestamps]}
        self._rate_limits: Dict[str, List[float]] = {}

    def get_client(self) -> Optional[Any]:
        """Lazy-initializes or returns the injected Google GenAI client."""
        if self._client is not None:
            return self._client
        if not settings.is_ai_configured:
            return None
        try:
            from google import genai
            self._client = genai.Client(api_key=settings.gemini_api_key)
            return self._client
        except Exception as exc:
            logger.error(f"Failed to initialize google-genai client: {type(exc).__name__}")
            return None

    def check_rate_limit(self, client_ip: str) -> bool:
        """
        Sliding window in-memory rate limiter per IP.
        Returns True if allowed, False if rate limited.
        """
        now = time.time()
        window_start = now - 60.0
        timestamps = self._rate_limits.get(client_ip, [])
        # Prune older than 60 seconds
        recent = [t for t in timestamps if t > window_start]
        if len(recent) >= settings.rate_limit_per_minute:
            self._rate_limits[client_ip] = recent
            return False
        recent.append(now)
        self._rate_limits[client_ip] = recent
        return True

    def _generate_cache_key(self, lat: float, lon: float, aqi_bucket: str, profile: Optional[Dict[str, Any]]) -> str:
        prof_str = json.dumps(profile or {}, sort_keys=True)
        prof_hash = hashlib.sha256(prof_str.encode()).hexdigest()[:10]
        return f"{round(lat, 2)}:{round(lon, 2)}:{aqi_bucket}:{prof_hash}"

    async def generate_recommendations(
        self,
        latitude: float,
        longitude: float,
        aq_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        city_name: Optional[str] = None,
        profile: Optional[Dict[str, Any]] = None
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Generates structured recommendations via Gemini with caching and safety filtering.
        Returns: (result_dict_or_none, fallback_reason)
        """
        if not settings.ai_enabled:
            return None, "disabled"
        if not settings.is_ai_configured:
            return None, "not_configured"

        client = self.get_client()
        if not client:
            return None, "not_configured"

        # Check Cache
        raw_us_aqi = aq_data.get("current", {}).get("us_aqi")
        aqi_bucket = f"aqi_{(raw_us_aqi // 50) * 50 if raw_us_aqi is not None else 'na'}"
        cache_key = self._generate_cache_key(latitude, longitude, aqi_bucket, profile)

        now = time.time()
        if cache_key in self._cache:
            ts, cached_val = self._cache[cache_key]
            if now - ts < self._cache_ttl_seconds:
                return cached_val, None

        # Build Context & Prompt
        context = build_environmental_context(
            latitude=latitude,
            longitude=longitude,
            aq_data=aq_data,
            weather_data=weather_data,
            city_name=city_name,
            profile=profile
        )
        prompt_text = build_recommendation_prompt(context)

        # Single flight request deduplication
        if cache_key in self._in_flight:
            try:
                res = await self._in_flight[cache_key]
                return res, None
            except Exception:
                pass  # Fall through to execute

        loop = asyncio.get_running_loop()
        future = loop.create_future()
        self._in_flight[cache_key] = future

        try:
            # Model execution with 1 retry on transient error
            data, reason = await self._call_gemini_with_retry(client, prompt_text, is_json=True)
            if data:
                self._cache[cache_key] = (now, data)
                if not future.done():
                    future.set_result(data)
                return data, None
            else:
                if not future.done():
                    future.set_result(None)
                return None, reason
        finally:
            self._in_flight.pop(cache_key, None)

    async def _call_gemini_with_retry(
        self,
        client: Any,
        prompt: str,
        is_json: bool = True
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Executes Gemini call with hard timeout, 1 transient retry, and safety validation.
        """
        max_attempts = 2
        last_reason = "provider_error"

        for attempt in range(max_attempts):
            try:
                # Prepare GenerateContentConfig
                from google.genai import types

                config = types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.3,
                    max_output_tokens=settings.ai_max_output_tokens,
                    response_mime_type="application/json" if is_json else "text/plain"
                )

                # Execute with hard timeout
                async def _invoke():
                    return await client.aio.models.generate_content(
                        model=settings.gemini_model,
                        contents=prompt,
                        config=config
                    )

                response = await asyncio.wait_for(
                    _invoke(),
                    timeout=float(settings.ai_timeout_seconds)
                )

                # Parse response text
                raw_text = getattr(response, "text", "") or ""
                if not raw_text.strip():
                    return None, "invalid_output"

                # Clean markdown code fences if present
                clean_json_str = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text.strip())

                try:
                    parsed = json.loads(clean_json_str)
                except json.JSONDecodeError:
                    logger.warning("Gemini output failed JSON decoding")
                    return None, "invalid_output"

                # Validate schema and safety filter
                valid, filtered, safety_reason = validate_and_filter_ai_recommendations(parsed)
                if not valid:
                    return None, "safety_filtered"

                return filtered, None

            except asyncio.TimeoutError:
                logger.warning("Gemini AI request timed out")
                return None, "timeout"

            except Exception as exc:
                err_str = str(exc).lower()
                logger.warning(f"Gemini call exception on attempt {attempt+1}: {type(exc).__name__} - {err_str[:120]}")

                if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                    return None, "rate_limited"

                if "not found" in err_str or "unknown model" in err_str:
                    logger.error(f"Configured GEMINI_MODEL '{settings.gemini_model}' not found by provider.")
                    return None, "provider_error"

                if attempt == 0 and ("500" in err_str or "503" in err_str or "connection" in err_str):
                    await asyncio.sleep(1.0)
                    continue

                last_reason = "provider_error"

        return None, last_reason

    async def generate_chat_reply(
        self,
        message: str,
        history: List[Dict[str, str]],
        context: Dict[str, Any]
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Generates a conversational response using Gemini.
        Returns: (reply_text_or_none, fallback_reason)
        """
        if not settings.ai_enabled:
            return None, "disabled"
        if not settings.is_ai_configured:
            return None, "not_configured"

        client = self.get_client()
        if not client:
            return None, "not_configured"

        # Sanitize and truncate inputs
        clean_msg = message.strip()[:settings.chat_max_message_chars]
        recent_history = history[-settings.chat_max_history_turns:]

        # Build prompt
        prompt = build_chat_prompt(clean_msg, context, recent_history)

        try:
            from google.genai import types

            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.4,
                max_output_tokens=1000
            )

            async def _invoke():
                return await client.aio.models.generate_content(
                    model=settings.gemini_model,
                    contents=prompt,
                    config=config
                )

            response = await asyncio.wait_for(
                _invoke(),
                timeout=float(settings.ai_timeout_seconds)
            )

            raw_text = getattr(response, "text", "") or ""
            if not raw_text.strip():
                return None, "invalid_output"

            return raw_text.strip(), None

        except asyncio.TimeoutError:
            logger.warning("Gemini chat request timed out")
            return None, "timeout"
        except Exception as exc:
            err_str = str(exc).lower()
            logger.warning(f"Gemini chat error: {type(exc).__name__}")
            if "429" in err_str or "quota" in err_str:
                return None, "rate_limited"
            return None, "provider_error"


# Global AI Service instance
ai_service = AIService()
