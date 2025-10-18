from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HealthRecordCreate(BaseModel):
    """건강 기록 생성 스키마"""

    record_type: str  # "blood_pressure", "blood_sugar", "weight", etc.
    value: float
    unit: str
    systolic: Optional[float] = None
    diastolic: Optional[float] = None
    notes: Optional[str] = None
    measured_at: Optional[datetime] = None


class HealthRecordResponse(BaseModel):
    """건강 기록 응답 스키마"""

    id: int
    user_id: int
    record_type: str
    value: float
    unit: str
    systolic: Optional[float]
    diastolic: Optional[float]
    notes: Optional[str]
    measured_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
