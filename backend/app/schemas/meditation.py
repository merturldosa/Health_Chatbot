from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MeditationSessionBase(BaseModel):
    session_type: str  # meditation, breathing
    program_name: str  # guided_5min, guided_10min, guided_20min, box_breathing, 478_breathing
    duration_minutes: int
    completed: str = "completed"  # completed, interrupted
    notes: Optional[str] = None


class MeditationSessionCreate(MeditationSessionBase):
    pass


class MeditationSession(MeditationSessionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MeditationProgramInfo(BaseModel):
    """명상/호흡 프로그램 정보"""
    id: str
    name: str
    type: str  # meditation, breathing
    duration_minutes: int
    description: str
    benefits: list[str]
    instructions: list[str]
