from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class MentalHealthCheck(Base):
    """정신 건강 체크 모델"""

    __tablename__ = "mental_health_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 평가 점수 (1-10)
    stress_level = Column(Integer)
    anxiety_level = Column(Integer)
    mood_level = Column(Integer)  # 기분 (1: 매우 우울 ~ 10: 매우 좋음)
    sleep_quality = Column(Integer)

    # 상세 내용
    symptoms = Column(String)  # JSON 문자열로 여러 증상 저장
    notes = Column(Text)

    # AI 분석 결과
    ai_assessment = Column(Text)
    recommendations = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="mental_health_checks")
