from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..models.medication import Medication
from ..schemas.medication import MedicationCreate, MedicationResponse
from ..dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/api/medications", tags=["medications"])


@router.post("/", response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
async def create_medication(
    medication_data: MedicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """복약 정보 생성"""

    # PostgreSQL: timezone-aware datetime을 timezone-naive로 변환
    start_date = medication_data.start_date
    end_date = medication_data.end_date

    if start_date and start_date.tzinfo is not None:
        start_date = start_date.replace(tzinfo=None)
    if end_date and end_date.tzinfo is not None:
        end_date = end_date.replace(tzinfo=None)

    new_medication = Medication(
        user_id=current_user.id,
        medication_name=medication_data.medication_name,
        dosage=medication_data.dosage,
        frequency=medication_data.frequency,
        time_morning=medication_data.time_morning,
        time_afternoon=medication_data.time_afternoon,
        time_evening=medication_data.time_evening,
        start_date=start_date,
        end_date=end_date,
        reminder_enabled=medication_data.reminder_enabled,
        notes=medication_data.notes,
    )

    db.add(new_medication)
    await db.commit()
    await db.refresh(new_medication)

    return new_medication


@router.get("/", response_model=List[MedicationResponse])
async def get_medications(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """복약 목록 조회"""

    query = select(Medication).where(Medication.user_id == current_user.id)

    if active_only:
        query = query.where(Medication.is_active == True)

    result = await db.execute(query)
    medications = result.scalars().all()

    return medications


@router.get("/{medication_id}", response_model=MedicationResponse)
async def get_medication(
    medication_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """특정 복약 정보 조회"""

    result = await db.execute(
        select(Medication).where(
            Medication.id == medication_id, Medication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="복약 정보를 찾을 수 없습니다.",
        )

    return medication


@router.put("/{medication_id}", response_model=MedicationResponse)
async def update_medication(
    medication_id: int,
    medication_data: MedicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """복약 정보 수정"""

    result = await db.execute(
        select(Medication).where(
            Medication.id == medication_id, Medication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="복약 정보를 찾을 수 없습니다.",
        )

    # 업데이트
    medication.medication_name = medication_data.medication_name
    medication.dosage = medication_data.dosage
    medication.frequency = medication_data.frequency
    medication.time_morning = medication_data.time_morning
    medication.time_afternoon = medication_data.time_afternoon
    medication.time_evening = medication_data.time_evening
    medication.start_date = medication_data.start_date
    medication.end_date = medication_data.end_date
    medication.reminder_enabled = medication_data.reminder_enabled
    medication.notes = medication_data.notes

    await db.commit()
    await db.refresh(medication)

    return medication


@router.delete("/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """복약 정보 삭제 (비활성화)"""

    result = await db.execute(
        select(Medication).where(
            Medication.id == medication_id, Medication.user_id == current_user.id
        )
    )
    medication = result.scalar_one_or_none()

    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="복약 정보를 찾을 수 없습니다.",
        )

    medication.is_active = False
    await db.commit()

    return None
