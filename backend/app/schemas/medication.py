from pydantic import BaseModel
from typing import Optional
from datetime import datetime, time


class MedicationCreate(BaseModel):
    """복약 생성 스키마"""

    medication_name: str
    dosage: str
    frequency: str
    time_morning: Optional[time] = None
    time_afternoon: Optional[time] = None
    time_evening: Optional[time] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    reminder_enabled: bool = True
    notes: Optional[str] = None


class MedicationResponse(BaseModel):
    """복약 응답 스키마"""

    id: int
    user_id: int
    medication_name: str
    dosage: str
    frequency: str
    time_morning: Optional[time]
    time_afternoon: Optional[time]
    time_evening: Optional[time]
    start_date: datetime
    end_date: Optional[datetime]
    reminder_enabled: bool
    notes: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
