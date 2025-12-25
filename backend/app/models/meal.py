from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class Meal(Base):
    """식단 기록 모델"""

    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 식사 정보
    meal_type = Column(String, nullable=False)  # breakfast, lunch, dinner, snack
    meal_date = Column(DateTime, nullable=False, default=datetime.utcnow)

    # 이미지 정보
    image_url = Column(String)  # 식단 사진 URL

    # AI 분석 결과
    ai_analysis = Column(Text)  # AI 이미지 분석 결과
    ai_recommendation = Column(Text)  # AI 추천 식단
    match_percentage = Column(Float)  # AI 추천 식단과의 일치도 (0-100)

    # 영양 정보 (AI 분석 결과)
    calories = Column(Float)  # 칼로리
    protein = Column(Float)  # 단백질(g)
    carbs = Column(Float)  # 탄수화물(g)
    fat = Column(Float)  # 지방(g)

    # 메모
    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="meals")
