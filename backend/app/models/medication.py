from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Time
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Medication(Base):
    """복약 관리 모델"""

    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    medication_name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)  # 예: "500mg", "1정"
    frequency = Column(String, nullable=False)  # 예: "하루 3회", "8시간마다"

    # 복용 시간
    time_morning = Column(Time)
    time_afternoon = Column(Time)
    time_evening = Column(Time)

    # 복용 기간
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)

    # 알림 설정
    reminder_enabled = Column(Boolean, default=True)

    notes = Column(String)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="medications")
