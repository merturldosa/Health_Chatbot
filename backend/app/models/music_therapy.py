from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class MusicSession(Base):
    """음악 치료 세션 기록"""
    __tablename__ = "music_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    music_type = Column(String, nullable=False)  # binaural, nature, classical, healing_frequency
    purpose = Column(String, nullable=False)  # sleep, anxiety, focus, pain_relief
    duration_minutes = Column(Integer, nullable=False)
    mood_before = Column(String, nullable=True)  # calm, anxious, stressed, sad, angry
    mood_after = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="music_sessions")
