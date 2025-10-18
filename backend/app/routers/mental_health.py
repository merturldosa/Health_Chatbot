from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from ..database import get_db
from ..models.user import User
from ..models.mental_health import MentalHealthCheck
from ..schemas.mental_health import MentalHealthCheckCreate, MentalHealthCheckResponse
from ..services.ai_service import AIService
from ..dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/api/mental-health", tags=["mental-health"])
ai_service = AIService()


@router.post("/", response_model=MentalHealthCheckResponse, status_code=status.HTTP_201_CREATED)
async def create_mental_health_check(
    check_data: MentalHealthCheckCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """정신 건강 체크 생성"""

    # AI 평가 받기
    try:
        ai_result = await ai_service.mental_health_assessment(
            stress_level=check_data.stress_level,
            anxiety_level=check_data.anxiety_level,
            mood_level=check_data.mood_level,
            sleep_quality=check_data.sleep_quality,
            notes=check_data.notes,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 서비스 오류: {str(e)}")

    # 기록 저장
    new_check = MentalHealthCheck(
        user_id=current_user.id,
        stress_level=check_data.stress_level,
        anxiety_level=check_data.anxiety_level,
        mood_level=check_data.mood_level,
        sleep_quality=check_data.sleep_quality,
        symptoms=check_data.symptoms,
        notes=check_data.notes,
        ai_assessment=ai_result["assessment"],
        recommendations=ai_result["recommendations"],
    )

    db.add(new_check)
    await db.commit()
    await db.refresh(new_check)

    return new_check


@router.get("/", response_model=List[MentalHealthCheckResponse])
async def get_mental_health_checks(
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """정신 건강 체크 목록 조회"""

    result = await db.execute(
        select(MentalHealthCheck)
        .where(MentalHealthCheck.user_id == current_user.id)
        .order_by(desc(MentalHealthCheck.created_at))
        .limit(limit)
    )
    checks = result.scalars().all()

    return checks


@router.get("/{check_id}", response_model=MentalHealthCheckResponse)
async def get_mental_health_check(
    check_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """특정 정신 건강 체크 조회"""

    result = await db.execute(
        select(MentalHealthCheck).where(
            MentalHealthCheck.id == check_id, MentalHealthCheck.user_id == current_user.id
        )
    )
    check = result.scalar_one_or_none()

    if not check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="정신 건강 체크를 찾을 수 없습니다.",
        )

    return check
