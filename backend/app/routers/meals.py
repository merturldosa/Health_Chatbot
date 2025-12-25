from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..models.meal import Meal
from ..schemas.meal import MealCreate, MealResponse
from ..dependencies import get_current_user
from ..services.ai_nutrition_analyzer import get_nutrition_analyzer
from typing import List
from datetime import datetime, timedelta
import base64
import os
import json

router = APIRouter(prefix="/api/meals", tags=["meals"])


@router.post("/", response_model=MealResponse, status_code=status.HTTP_201_CREATED)
async def create_meal(
    meal_data: MealCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """식단 기록 생성"""

    new_meal = Meal(
        user_id=current_user.id,
        meal_type=meal_data.meal_type,
        meal_date=meal_data.meal_date,
        image_url=meal_data.image_url,
        notes=meal_data.notes,
    )

    db.add(new_meal)
    await db.commit()
    await db.refresh(new_meal)

    return new_meal


@router.post("/upload-image")
async def upload_meal_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """식단 사진 업로드"""

    # 파일 확장자 검증
    allowed_extensions = ["jpg", "jpeg", "png", "webp"]
    file_extension = file.filename.split(".")[-1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="지원하지 않는 파일 형식입니다. (jpg, jpeg, png, webp만 가능)",
        )

    # 파일 읽기
    contents = await file.read()

    # Base64 인코딩
    base64_image = base64.b64encode(contents).decode("utf-8")
    image_data_url = f"data:image/{file_extension};base64,{base64_image}"

    return {"image_url": image_data_url, "filename": file.filename}


@router.get("/", response_model=List[MealResponse])
async def get_meals(
    start_date: str = None,
    end_date: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """식단 목록 조회"""

    query = select(Meal).where(Meal.user_id == current_user.id)

    if start_date:
        start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        query = query.where(Meal.meal_date >= start)

    if end_date:
        end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
        query = query.where(Meal.meal_date <= end)

    query = query.order_by(Meal.meal_date.desc())

    result = await db.execute(query)
    meals = result.scalars().all()

    return meals


@router.get("/today", response_model=List[MealResponse])
async def get_today_meals(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """오늘의 식단 조회"""

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    query = (
        select(Meal)
        .where(Meal.user_id == current_user.id)
        .where(Meal.meal_date >= today_start)
        .where(Meal.meal_date < today_end)
        .order_by(Meal.meal_date.desc())
    )

    result = await db.execute(query)
    meals = result.scalars().all()

    return meals


@router.get("/{meal_id}", response_model=MealResponse)
async def get_meal(
    meal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """특정 식단 조회"""

    result = await db.execute(
        select(Meal).where(Meal.id == meal_id, Meal.user_id == current_user.id)
    )
    meal = result.scalar_one_or_none()

    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="식단 기록을 찾을 수 없습니다.",
        )

    return meal


@router.delete("/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meal(
    meal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """식단 기록 삭제"""

    result = await db.execute(
        select(Meal).where(Meal.id == meal_id, Meal.user_id == current_user.id)
    )
    meal = result.scalar_one_or_none()

    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="식단 기록을 찾을 수 없습니다.",
        )

    await db.delete(meal)
    await db.commit()

    return None


@router.post("/{meal_id}/analyze")
async def analyze_meal(
    meal_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """식단 이미지 AI 분석"""

    # 식단 조회
    result = await db.execute(
        select(Meal).where(Meal.id == meal_id, Meal.user_id == current_user.id)
    )
    meal = result.scalar_one_or_none()

    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="식단 기록을 찾을 수 없습니다.",
        )

    if not meal.image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="식단 이미지가 없습니다.",
        )

    try:
        # AI 분석 수행
        analyzer = get_nutrition_analyzer()
        analysis_result = await analyzer.analyze_meal(
            image_url=meal.image_url,
            meal_type=meal.meal_type,
            user_health_goals=None,  # 추후 사용자 프로필에서 가져올 수 있음
        )

        # 분석 결과를 DB에 저장
        meal.ai_analysis = analysis_result["ai_analysis"]
        meal.ai_recommendation = analysis_result["ai_recommendation"]
        meal.match_percentage = analysis_result["match_percentage"]
        meal.calories = analysis_result["calories"]
        meal.protein = analysis_result["protein"]
        meal.carbs = analysis_result["carbs"]
        meal.fat = analysis_result["fat"]

        await db.commit()
        await db.refresh(meal)

        # 추가 정보도 함께 반환
        return {
            "meal": meal,
            "detected_foods": analysis_result["detected_foods"],
            "health_score": analysis_result["health_score"],
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI 분석 중 오류가 발생했습니다: {str(e)}",
        )
