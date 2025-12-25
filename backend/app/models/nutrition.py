from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class FoodItem(Base):
    """음식 데이터베이스 모델"""
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)

    # 기본 정보
    food_name = Column(String(255), nullable=False, index=True)  # 음식명
    food_name_en = Column(String(255))  # 영문명
    food_category = Column(String(100))  # 카테고리: 곡류, 채소, 과일, 육류, 유제품 등

    # 영양 정보 (per 100g)
    serving_size = Column(Float, default=100.0)  # 기준 제공량 (g)
    calories = Column(Float)  # 칼로리 (kcal)
    protein = Column(Float)  # 단백질 (g)
    carbohydrates = Column(Float)  # 탄수화물 (g)
    fat = Column(Float)  # 지방 (g)
    fiber = Column(Float)  # 식이섬유 (g)
    sugar = Column(Float)  # 당류 (g)

    # 미량 영양소
    sodium = Column(Float)  # 나트륨 (mg)
    cholesterol = Column(Float)  # 콜레스테롤 (mg)
    saturated_fat = Column(Float)  # 포화지방 (g)

    # 비타민
    vitamin_a = Column(Float)  # 비타민 A (μg)
    vitamin_c = Column(Float)  # 비타민 C (mg)
    vitamin_d = Column(Float)  # 비타민 D (μg)
    vitamin_b12 = Column(Float)  # 비타민 B12 (μg)

    # 미네랄
    calcium = Column(Float)  # 칼슘 (mg)
    iron = Column(Float)  # 철분 (mg)
    potassium = Column(Float)  # 칼륨 (mg)
    magnesium = Column(Float)  # 마그네슘 (mg)

    # 기타 정보
    glycemic_index = Column(Integer)  # 혈당 지수
    allergens = Column(JSON)  # 알레르기 유발 물질
    health_benefits = Column(Text)  # 건강 효능
    precautions = Column(Text)  # 주의사항

    # 추천 대상
    recommended_for_pregnancy = Column(Boolean, default=False)  # 임산부 추천
    recommended_for_children = Column(Boolean, default=False)  # 어린이 추천
    recommended_for_elderly = Column(Boolean, default=False)  # 노인 추천
    recommended_for_disease = Column(JSON)  # 질병별 추천 (예: ["diabetes", "hypertension"])

    # 이미지
    image_url = Column(String(500))

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class NutritionPlan(Base):
    """영양 계획 모델"""
    __tablename__ = "nutrition_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 계획 정보
    plan_name = Column(String(255), nullable=False)
    plan_type = Column(String(50))  # weight_loss, muscle_gain, pregnancy, disease_management, general_health
    target_calories = Column(Float)  # 목표 칼로리 (kcal/day)

    # 영양소 목표
    target_protein = Column(Float)  # 목표 단백질 (g/day)
    target_carbs = Column(Float)  # 목표 탄수화물 (g/day)
    target_fat = Column(Float)  # 목표 지방 (g/day)
    target_fiber = Column(Float)  # 목표 식이섬유 (g/day)

    # 제한사항
    restrictions = Column(JSON)  # 식단 제한 (예: ["vegetarian", "gluten-free"])
    allergens_to_avoid = Column(JSON)  # 피해야 할 알레르기 항목

    # 기간
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)

    # AI 생성
    ai_generated = Column(Boolean, default=False)
    ai_recommendations = Column(Text)

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("User")
    daily_intakes = relationship("DailyNutritionIntake", back_populates="nutrition_plan", cascade="all, delete-orphan")


class DailyNutritionIntake(Base):
    """일일 영양 섭취 기록 모델"""
    __tablename__ = "daily_nutrition_intakes"

    id = Column(Integer, primary_key=True, index=True)
    nutrition_plan_id = Column(Integer, ForeignKey("nutrition_plans.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 날짜
    intake_date = Column(DateTime, nullable=False)

    # 실제 섭취량
    total_calories = Column(Float, default=0.0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fat = Column(Float, default=0.0)
    total_fiber = Column(Float, default=0.0)
    total_sodium = Column(Float, default=0.0)

    # 식사별 칼로리
    breakfast_calories = Column(Float, default=0.0)
    lunch_calories = Column(Float, default=0.0)
    dinner_calories = Column(Float, default=0.0)
    snack_calories = Column(Float, default=0.0)

    # 수분 섭취
    water_intake = Column(Float)  # 리터

    # 목표 달성률
    calorie_achievement_rate = Column(Float)  # 0-100
    protein_achievement_rate = Column(Float)

    # AI 분석
    ai_analysis = Column(Text)
    ai_suggestions = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    nutrition_plan = relationship("NutritionPlan", back_populates="daily_intakes")
    user = relationship("User")


class FoodDiary(Base):
    """음식 일기 모델 (상세 기록)"""
    __tablename__ = "food_diaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 기본 정보
    diary_date = Column(DateTime, nullable=False)
    meal_type = Column(String(50))  # breakfast, lunch, dinner, snack

    # 음식 정보
    food_name = Column(String(255), nullable=False)
    food_item_id = Column(Integer, ForeignKey("food_items.id"))  # 음식 DB 참조
    serving_amount = Column(Float)  # 섭취량 (g)

    # 영양 정보 (계산된 값)
    calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)

    # 이미지
    food_image_url = Column(String(500))

    # 감정/메모
    taste_rating = Column(Integer)  # 맛 평가 (1-5)
    satisfaction_rating = Column(Integer)  # 만족도 (1-5)
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    user = relationship("User")
    food_item = relationship("FoodItem")


class NutritionRecommendation(Base):
    """영양 추천 모델 (AI 기반)"""
    __tablename__ = "nutrition_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 추천 정보
    recommendation_type = Column(String(50))  # meal_suggestion, nutrient_boost, balance_improvement
    recommended_date = Column(DateTime, nullable=False, default=datetime.utcnow)

    # 추천 음식/영양소
    recommended_foods = Column(JSON)  # 추천 음식 리스트
    recommended_nutrients = Column(JSON)  # 부족한 영양소

    # 이유
    reason = Column(Text)  # 추천 이유
    health_goal = Column(String(100))  # 건강 목표

    # AI 분석
    ai_analysis = Column(Text)
    confidence_score = Column(Float)  # 추천 신뢰도 (0-1)

    # 사용자 반응
    is_accepted = Column(Boolean)  # 사용자가 받아들였는지
    user_feedback = Column(Text)  # 사용자 피드백

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    user = relationship("User")


class RecipeRecommendation(Base):
    """레시피 추천 모델"""
    __tablename__ = "recipe_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    # 레시피 정보
    recipe_name = Column(String(255), nullable=False)
    recipe_category = Column(String(100))  # 한식, 양식, 중식, 일식, 디저트 등
    difficulty = Column(String(20))  # easy, medium, hard
    cooking_time = Column(Integer)  # 조리 시간 (분)

    # 재료
    ingredients = Column(JSON, nullable=False)  # [{"name": "...", "amount": "...", "unit": "..."}]

    # 조리법
    instructions = Column(Text)

    # 영양 정보
    servings = Column(Integer)  # 인분
    calories_per_serving = Column(Float)
    nutrition_info = Column(JSON)

    # 태그
    tags = Column(JSON)  # ["건강식", "다이어트", "임산부", "어린이" 등]
    suitable_for = Column(JSON)  # 적합한 대상 그룹

    # 이미지
    image_url = Column(String(500))
    video_url = Column(String(500))

    # AI 추천
    ai_recommended = Column(Boolean, default=False)
    recommendation_reason = Column(Text)

    # 평가
    rating = Column(Float)  # 평균 평점
    review_count = Column(Integer, default=0)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("User")
