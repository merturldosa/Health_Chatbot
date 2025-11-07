from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MusicSessionBase(BaseModel):
    music_type: str  # binaural, nature, classical, healing_frequency
    purpose: str  # sleep, anxiety, focus, pain_relief
    duration_minutes: int
    mood_before: Optional[str] = None
    mood_after: Optional[str] = None
    notes: Optional[str] = None


class MusicSessionCreate(MusicSessionBase):
    pass


class MusicSession(MusicSessionBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MusicProgramInfo(BaseModel):
    """음악 치료 프로그램 정보"""
    id: str
    name: str
    type: str  # binaural, nature, classical, healing_frequency
    purpose: str
    description: str
    benefits: list[str]
    duration_minutes: int
    youtube_url: Optional[str] = None
