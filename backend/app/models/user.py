from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class User(Base):
    """사용자 모델"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    age = Column(Integer)
    gender = Column(Enum(Gender))
    phone = Column(String)

    # 기저질환
    chronic_conditions = Column(String)  # JSON 문자열로 저장
    allergies = Column(String)  # JSON 문자열로 저장

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    health_records = relationship("HealthRecord", back_populates="user", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="user", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    mental_health_checks = relationship("MentalHealthCheck", back_populates="user", cascade="all, delete-orphan")
    mood_records = relationship("MoodRecord", back_populates="user", cascade="all, delete-orphan")
    meditation_sessions = relationship("MeditationSession", back_populates="user", cascade="all, delete-orphan")
    music_sessions = relationship("MusicSession", back_populates="user", cascade="all, delete-orphan")
    sleep_records = relationship("SleepRecord", back_populates="user", cascade="all, delete-orphan")
