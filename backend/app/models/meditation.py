from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class MeditationSession(Base):
    """명상/호흡 운동 세션 기록"""
    __tablename__ = "meditation_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_type = Column(String, nullable=False)  # meditation, breathing
    program_name = Column(String, nullable=False)  # guided_5min, box_breathing, etc.
    duration_minutes = Column(Integer, nullable=False)  # 실제 진행 시간
    completed = Column(String, nullable=False, default="completed")  # completed, interrupted
    notes = Column(String, nullable=True)  # 사용자 메모
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="meditation_sessions")
