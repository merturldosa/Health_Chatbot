from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MealCreate(BaseModel):
    """식단 생성 스키마"""

    meal_type: str  # breakfast, lunch, dinner, snack
    meal_date: datetime
    image_url: Optional[str] = None
    notes: Optional[str] = None


class MealResponse(BaseModel):
    """식단 응답 스키마"""

    id: int
    user_id: int
    meal_type: str
    meal_date: datetime
    image_url: Optional[str]
    ai_analysis: Optional[str]
    ai_recommendation: Optional[str]
    match_percentage: Optional[float]
    calories: Optional[float]
    protein: Optional[float]
    carbs: Optional[float]
    fat: Optional[float]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
