from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SleepRecordCreate(BaseModel):
    """수면 기록 생성 스키마"""

    sleep_start: datetime
    sleep_end: datetime
    duration_hours: float
    sleep_quality: int  # 1-10
    deep_sleep_hours: Optional[float] = None
    rem_sleep_hours: Optional[float] = None
    light_sleep_hours: Optional[float] = None
    awake_count: Optional[int] = None
    sleep_environment: Optional[str] = None
    room_temperature: Optional[float] = None
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    notes: Optional[str] = None


class SleepRecordResponse(BaseModel):
    """수면 기록 응답 스키마"""

    id: int
    user_id: int
    sleep_start: datetime
    sleep_end: datetime
    duration_hours: float
    sleep_quality: int
    deep_sleep_hours: Optional[float]
    rem_sleep_hours: Optional[float]
    light_sleep_hours: Optional[float]
    awake_count: Optional[int]
    sleep_environment: Optional[str]
    room_temperature: Optional[float]
    mood_before: Optional[str]
    mood_after: Optional[str]
    notes: Optional[str]
    ai_analysis: Optional[str]
    ai_recommendations: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
