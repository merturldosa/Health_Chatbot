from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..models.sleep import SleepRecord
from ..schemas.sleep import SleepRecordCreate, SleepRecordResponse
from ..dependencies import get_current_user
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/sleep", tags=["sleep"])


@router.post("/", response_model=SleepRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_sleep_record(
    sleep_data: SleepRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """수면 기록 생성"""

    new_sleep = SleepRecord(
        user_id=current_user.id,
        sleep_start=sleep_data.sleep_start,
        sleep_end=sleep_data.sleep_end,
        duration_hours=sleep_data.duration_hours,
        sleep_quality=sleep_data.sleep_quality,
        deep_sleep_hours=sleep_data.deep_sleep_hours,
        rem_sleep_hours=sleep_data.rem_sleep_hours,
        light_sleep_hours=sleep_data.light_sleep_hours,
        awake_count=sleep_data.awake_count,
        sleep_environment=sleep_data.sleep_environment,
        room_temperature=sleep_data.room_temperature,
        mood_before=sleep_data.mood_before,
        mood_after=sleep_data.mood_after,
        notes=sleep_data.notes,
    )

    db.add(new_sleep)
    await db.commit()
    await db.refresh(new_sleep)

    return new_sleep


@router.get("/", response_model=List[SleepRecordResponse])
async def get_sleep_records(
    start_date: str = None,
    end_date: str = None,
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """수면 기록 목록 조회"""

    query = select(SleepRecord).where(SleepRecord.user_id == current_user.id)

    if start_date:
        start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        query = query.where(SleepRecord.sleep_start >= start)

    if end_date:
        end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
        query = query.where(SleepRecord.sleep_start <= end)

    query = query.order_by(SleepRecord.sleep_start.desc()).limit(limit)

    result = await db.execute(query)
    sleep_records = result.scalars().all()

    return sleep_records


@router.get("/latest", response_model=SleepRecordResponse)
async def get_latest_sleep_record(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """최근 수면 기록 조회"""

    query = (
        select(SleepRecord)
        .where(SleepRecord.user_id == current_user.id)
        .order_by(SleepRecord.sleep_start.desc())
        .limit(1)
    )

    result = await db.execute(query)
    sleep_record = result.scalar_one_or_none()

    if not sleep_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="수면 기록이 없습니다.",
        )

    return sleep_record


@router.get("/statistics")
async def get_sleep_statistics(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """수면 통계 조회"""

    start_date = datetime.utcnow() - timedelta(days=days)

    query = (
        select(SleepRecord)
        .where(SleepRecord.user_id == current_user.id)
        .where(SleepRecord.sleep_start >= start_date)
        .order_by(SleepRecord.sleep_start.desc())
    )

    result = await db.execute(query)
    records = result.scalars().all()

    if not records:
        return {
            "count": 0,
            "average_duration": 0,
            "average_quality": 0,
            "total_deep_sleep": 0,
            "total_rem_sleep": 0,
        }

    avg_duration = sum(r.duration_hours for r in records) / len(records)
    avg_quality = sum(r.sleep_quality for r in records) / len(records)
    total_deep = sum(r.deep_sleep_hours or 0 for r in records)
    total_rem = sum(r.rem_sleep_hours or 0 for r in records)

    return {
        "count": len(records),
        "average_duration": round(avg_duration, 2),
        "average_quality": round(avg_quality, 1),
        "total_deep_sleep": round(total_deep, 2),
        "total_rem_sleep": round(total_rem, 2),
    }


@router.delete("/{sleep_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sleep_record(
    sleep_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """수면 기록 삭제"""

    result = await db.execute(
        select(SleepRecord).where(
            SleepRecord.id == sleep_id, SleepRecord.user_id == current_user.id
        )
    )
    sleep_record = result.scalar_one_or_none()

    if not sleep_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="수면 기록을 찾을 수 없습니다.",
        )

    await db.delete(sleep_record)
    await db.commit()

    return None
