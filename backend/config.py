import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_KEY: str = os.getenv("GEMINI_API_KEY", "your_default_api_key")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your_jwt_secret")
    JWT_ALGORITHM: str = "HS256"
    APP_VERSION: str = "1.0.0"
    MODEL_NAME: str = "gemini-2.0-flash-exp"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()