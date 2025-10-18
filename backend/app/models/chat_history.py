from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class ChatType(str, enum.Enum):
    SYMPTOM_CHECK = "symptom_check"
    GENERAL_HEALTH = "general_health"
    MENTAL_HEALTH = "mental_health"
    MEDICATION = "medication"


class ChatHistory(Base):
    """챗봇 대화 기록 모델"""

    __tablename__ = "chat_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    chat_type = Column(Enum(ChatType), nullable=False)
    session_id = Column(String, index=True)  # 대화 세션 그룹화

    role = Column(String, nullable=False)  # "user" 또는 "assistant"
    message = Column(Text, nullable=False)

    # AI 응답 메타데이터
    urgency_level = Column(String)  # "low", "medium", "high", "emergency"
    suggested_action = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chat_histories")
