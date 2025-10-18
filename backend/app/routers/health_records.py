from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from ..database import get_db
from ..models.user import User
from ..models.health_record import HealthRecord
from ..schemas.health_record import HealthRecordCreate, HealthRecordResponse
from ..dependencies import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/health-records", tags=["health-records"])


@router.post("/", response_model=HealthRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_health_record(
    record_data: HealthRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """건강 기록 생성"""

    new_record = HealthRecord(
        user_id=current_user.id,
        record_type=record_data.record_type,
        value=record_data.value,
        unit=record_data.unit,
        systolic=record_data.systolic,
        diastolic=record_data.diastolic,
        notes=record_data.notes,
        measured_at=record_data.measured_at or datetime.utcnow(),
    )

    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)

    return new_record


@router.get("/", response_model=List[HealthRecordResponse])
async def get_health_records(
    record_type: str = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """건강 기록 조회"""

    query = select(HealthRecord).where(HealthRecord.user_id == current_user.id)

    if record_type:
        query = query.where(HealthRecord.record_type == record_type)

    query = query.order_by(desc(HealthRecord.measured_at)).limit(limit)

    result = await db.execute(query)
    records = result.scalars().all()

    return records


@router.get("/{record_id}", response_model=HealthRecordResponse)
async def get_health_record(
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """특정 건강 기록 조회"""

    result = await db.execute(
        select(HealthRecord).where(
            HealthRecord.id == record_id, HealthRecord.user_id == current_user.id
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="건강 기록을 찾을 수 없습니다.",
        )

    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_health_record(
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """건강 기록 삭제"""

    result = await db.execute(
        select(HealthRecord).where(
            HealthRecord.id == record_id, HealthRecord.user_id == current_user.id
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="건강 기록을 찾을 수 없습니다.",
        )

    await db.delete(record)
    await db.commit()

    return None
