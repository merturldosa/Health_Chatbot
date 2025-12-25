from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """앱 설정"""

    # Google Gemini AI
    GEMINI_API_KEY: str = "temp-key-please-set-in-railway"

    # Google Cloud Speech-to-Text
    # 서비스 계정 JSON 파일 경로 (선택)
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./health_chatbot.db"

    # Security
    SECRET_KEY: str = "temp-secret-key-please-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # App
    APP_NAME: str = "AI Health Chatbot"
    DEBUG: bool = True
    FRONTEND_URL: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
