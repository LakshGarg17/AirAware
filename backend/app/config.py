import json
import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AirAware API"
    app_version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    cors_origin_regex: str = r"^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$"
    
    # Open-Meteo API Endpoints (No API key required, CC BY 4.0)
    open_meteo_aq_url: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    open_meteo_weather_url: str = "https://api.open-meteo.com/v1/forecast"
    open_meteo_geocoding_url: str = "https://geocoding-api.open-meteo.com/v1/search"
    cache_ttl_seconds: int = 900
    
    # Day 4: Gemini AI Configuration (All optional so app boots with zero env vars)
    ai_enabled: bool = True
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.5-flash"
    ai_timeout_seconds: int = 20
    ai_max_output_tokens: int = 2048
    rate_limit_per_minute: int = 20
    chat_max_message_chars: int = 500
    chat_max_history_turns: int = 8

    @property
    def allowed_origins(self) -> List[str]:
        """Resolves explicit CORS origins from ALLOWED_ORIGINS or CORS_ORIGINS."""
        raw = os.getenv("ALLOWED_ORIGINS") or os.getenv("CORS_ORIGINS")
        if raw:
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(o).strip() for o in parsed if o]
            except Exception:
                pass
            return [o.strip() for o in raw.split(",") if o.strip()]
        if self.environment == "production":
            return ["https://airaware.vercel.app"]
        return self.cors_origins

    @property
    def is_ai_configured(self) -> bool:
        """Returns True only if a valid, non-empty Gemini API key is present."""
        return bool(self.gemini_api_key and self.gemini_api_key.strip())

    @property
    def is_ai_active(self) -> bool:
        """Returns True if AI is both enabled in settings and properly configured."""
        return self.ai_enabled and self.is_ai_configured
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
