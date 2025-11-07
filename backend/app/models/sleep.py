from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class SleepRecord(Base):
    """수면 기록"""
    __tablename__ = "sleep_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 수면 시간
    sleep_start = Column(DateTime, nullable=False)
    sleep_end = Column(DateTime, nullable=False)
    duration_hours = Column(Float, nullable=False)

    # 수면 질
    sleep_quality = Column(Integer, nullable=False)  # 1-10
    deep_sleep_hours = Column(Float, nullable=True)
    rem_sleep_hours = Column(Float, nullable=True)
    light_sleep_hours = Column(Float, nullable=True)
    awake_count = Column(Integer, default=0)

    # 수면 환경
    sleep_environment = Column(String, nullable=True)  # quiet, noisy, comfortable, uncomfortable
    room_temperature = Column(Float, nullable=True)

    # 수면 전후 상태
    mood_before = Column(String, nullable=True)  # energetic, tired, stressed, calm
    mood_after = Column(String, nullable=True)  # refreshed, tired, groggy, energetic

    # 메모 및 분석
    notes = Column(Text, nullable=True)
    ai_analysis = Column(Text, nullable=True)
    ai_recommendations = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="sleep_records")
