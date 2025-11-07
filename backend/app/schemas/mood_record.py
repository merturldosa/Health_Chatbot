from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MoodRecordCreate(BaseModel):
    """감정 기록 생성 스키마"""
    mood_level: str  # "very_happy", "happy", "neutral", "sad", "very_sad", "angry", "anxious", "stressed", "tired", "excited"
    mood_intensity: int  # 1-10
    note: Optional[str] = None
    activities: Optional[List[str]] = None  # ["운동", "업무", "친구 만남"]
    triggers: Optional[List[str]] = None  # ["스트레스", "좋은 소식"]
    recorded_at: Optional[datetime] = None


class MoodRecordResponse(BaseModel):
    """감정 기록 응답 스키마"""
    id: int
    user_id: int
    mood_level: str
    mood_intensity: int
    note: Optional[str]
    activities: Optional[str]
    triggers: Optional[str]
    ai_analysis: Optional[str]
    ai_advice: Optional[str]
    recorded_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class MoodStats(BaseModel):
    """감정 통계"""
    average_mood: float
    most_common_mood: str
    mood_trend: str  # "improving", "stable", "declining"
    total_records: int
    mood_distribution: dict  # {"happy": 5, "sad": 2, ...}
