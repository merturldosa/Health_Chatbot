from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """앱 설정"""

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./health_chatbot.db"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # App
    APP_NAME: str = "AI Health Chatbot"
    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
