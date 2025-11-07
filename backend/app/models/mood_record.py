from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class MoodLevel(str, enum.Enum):
    """감정 수준"""
    VERY_HAPPY = "very_happy"     # 😁 매우 행복
    HAPPY = "happy"                 # 😊 행복
    NEUTRAL = "neutral"             # 😐 보통
    SAD = "sad"                     # 😢 슬픔
    VERY_SAD = "very_sad"           # 😭 매우 슬픔
    ANGRY = "angry"                 # 😡 화남
    ANXIOUS = "anxious"             # 😰 불안
    STRESSED = "stressed"           # 😓 스트레스
    TIRED = "tired"                 # 😴 피곤
    EXCITED = "excited"             # 🤩 신남


class MoodRecord(Base):
    """감정 기록 모델"""
    __tablename__ = "mood_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 감정 정보
    mood_level = Column(Enum(MoodLevel), nullable=False)
    mood_intensity = Column(Integer, nullable=False)  # 1-10 강도

    # 추가 정보
    note = Column(Text, nullable=True)  # 감정 메모
    activities = Column(String(500), nullable=True)  # 활동 (JSON string)
    triggers = Column(String(500), nullable=True)  # 감정 유발 요인

    # AI 분석
    ai_analysis = Column(Text, nullable=True)  # AI 감정 분석
    ai_advice = Column(Text, nullable=True)  # AI 조언

    # 타임스탬프
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    user = relationship("User", back_populates="mood_records")

    def __repr__(self):
        return f"<MoodRecord {self.id}: {self.mood_level} at {self.recorded_at}>"
