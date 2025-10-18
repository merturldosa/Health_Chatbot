from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class RecordType(str, enum.Enum):
    BLOOD_PRESSURE = "blood_pressure"
    BLOOD_SUGAR = "blood_sugar"
    WEIGHT = "weight"
    HEART_RATE = "heart_rate"
    TEMPERATURE = "temperature"
    OXYGEN_SATURATION = "oxygen_saturation"
    OTHER = "other"


class HealthRecord(Base):
    """건강 기록 모델"""

    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    record_type = Column(Enum(RecordType), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)

    # 혈압의 경우 수축기/이완기
    systolic = Column(Float)  # 수축기 혈압
    diastolic = Column(Float)  # 이완기 혈압

    notes = Column(String)
    measured_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="health_records")
