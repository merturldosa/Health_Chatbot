from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MentalHealthCheckCreate(BaseModel):
    """정신 건강 체크 생성 스키마"""

    stress_level: Optional[int] = None  # 1-10
    anxiety_level: Optional[int] = None  # 1-10
    mood_level: Optional[int] = None  # 1-10
    sleep_quality: Optional[int] = None  # 1-10
    symptoms: Optional[str] = None
    notes: Optional[str] = None


class MentalHealthCheckResponse(BaseModel):
    """정신 건강 체크 응답 스키마"""

    id: int
    user_id: int
    stress_level: Optional[int]
    anxiety_level: Optional[int]
    mood_level: Optional[int]
    sleep_quality: Optional[int]
    symptoms: Optional[str]
    notes: Optional[str]
    ai_assessment: Optional[str]
    recommendations: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
