import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AirAware API"
    app_version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    cors_origins: List[str] = ["*"]
    
    # Open-Meteo API Endpoints (No API key required, CC BY 4.0)
    open_meteo_aq_url: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    open_meteo_weather_url: str = "https://api.open-meteo.com/v1/forecast"
    open_meteo_geocoding_url: str = "https://geocoding-api.open-meteo.com/v1/search"
    
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
