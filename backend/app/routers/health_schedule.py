from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..dependencies import get_current_user
from ..services.ai_health_scheduler import get_health_scheduler
from typing import List
import json

router = APIRouter(prefix="/api/health-schedule", tags=["health-schedule"])


@router.get("/")
async def get_health_schedule(
    days_ahead: int = 7,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """사용자 맞춤 건강 관리 스케줄 조회"""

    try:
        # 사용자 기본 정보
        user_data = {
            "age": current_user.age,
            "gender": current_user.gender,
            "chronic_conditions": current_user.chronic_conditions,
            "allergies": current_user.allergies,
        }

        # 건강 기록 조회 (간단한 버전 - 추후 확장 가능)
        health_history = []

        # TODO: 실제 건강 기록을 데이터베이스에서 조회
        # - 최근 식단 기록
        # - 최근 운동 기록
        # - 최근 수면 기록
        # - 최근 기분/정신 건강 기록

        # AI 스케줄러로 스케줄 생성
        scheduler = get_health_scheduler()
        schedule = await scheduler.generate_health_schedule(
            user_data=user_data,
            health_history=health_history,
            days_ahead=days_ahead,
        )

        return {
            "user_id": current_user.id,
            "generated_at": "2024-01-01T00:00:00",  # datetime.utcnow().isoformat()
            "schedule": schedule,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"스케줄 생성 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/today")
async def get_today_schedule(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """오늘의 건강 관리 스케줄 조회"""

    try:
        scheduler = get_health_scheduler()

        user_data = {
            "age": current_user.age,
            "gender": current_user.gender,
            "chronic_conditions": current_user.chronic_conditions,
            "allergies": current_user.allergies,
        }

        schedule = await scheduler.generate_health_schedule(
            user_data=user_data, health_history=[], days_ahead=1
        )

        # 오늘 날짜의 스케줄만 반환
        today_schedule = schedule[0] if schedule else None

        return today_schedule

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"오늘 스케줄 조회 중 오류가 발생했습니다: {str(e)}"
        )
