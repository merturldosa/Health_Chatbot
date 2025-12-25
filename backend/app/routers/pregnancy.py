from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from ..database import get_db
from ..models.user import User
from ..models.pregnancy import (
    PregnancyRecord,
    PrenatalCare,
    PregnancyLog,
    PostpartumCare,
    ChildDevelopment,
    GrowthRecord,
    DevelopmentLog,
    Vaccination,
    HealthCheckup,
)
from ..schemas.pregnancy import (
    PregnancyRecordCreate,
    PregnancyRecordUpdate,
    PregnancyRecordResponse,
    PrenatalCareCreate,
    PrenatalCareResponse,
    PregnancyLogCreate,
    PregnancyLogResponse,
    PostpartumCareCreate,
    PostpartumCareUpdate,
    PostpartumCareResponse,
    ChildDevelopmentCreate,
    ChildDevelopmentUpdate,
    ChildDevelopmentResponse,
    GrowthRecordCreate,
    GrowthRecordResponse,
    DevelopmentLogCreate,
    DevelopmentLogResponse,
    VaccinationCreate,
    VaccinationUpdate,
    VaccinationResponse,
    HealthCheckupCreate,
    HealthCheckupUpdate,
    HealthCheckupResponse,
)
from ..dependencies import get_current_user
from typing import List, Optional
from datetime import datetime, date, timedelta

router = APIRouter(prefix="/api/pregnancy", tags=["pregnancy"])


# ========== 임신 기록 관리 ==========

@router.post("/records", response_model=PregnancyRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_pregnancy_record(
    record_data: PregnancyRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """임신 기록 생성"""

    new_record = PregnancyRecord(
        user_id=current_user.id,
        pregnancy_status=record_data.pregnancy_status,
        conception_date=record_data.conception_date,
        due_date=record_data.due_date,
        pre_pregnancy_checkup_date=record_data.pre_pregnancy_checkup_date,
        pre_pregnancy_notes=record_data.pre_pregnancy_notes,
        hospital_name=record_data.hospital_name,
        doctor_name=record_data.doctor_name,
        baby_name=record_data.baby_name,
        number_of_babies=record_data.number_of_babies,
    )

    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)

    return new_record


@router.get("/records", response_model=List[PregnancyRecordResponse])
async def get_pregnancy_records(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """모든 임신 기록 조회"""

    query = (
        select(PregnancyRecord)
        .where(PregnancyRecord.user_id == current_user.id)
        .order_by(PregnancyRecord.created_at.desc())
    )

    result = await db.execute(query)
    records = result.scalars().all()

    return records


@router.get("/records/active", response_model=PregnancyRecordResponse)
async def get_active_pregnancy_record(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """현재 활성 임신 기록 조회"""

    query = (
        select(PregnancyRecord)
        .where(
            and_(
                PregnancyRecord.user_id == current_user.id,
                PregnancyRecord.pregnancy_status.in_(["preparing", "pregnant"])
            )
        )
        .order_by(PregnancyRecord.created_at.desc())
        .limit(1)
    )

    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="활성 임신 기록이 없습니다."
        )

    return record


@router.patch("/records/{record_id}", response_model=PregnancyRecordResponse)
async def update_pregnancy_record(
    record_id: int,
    update_data: PregnancyRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """임신 기록 업데이트"""

    query = select(PregnancyRecord).where(
        and_(
            PregnancyRecord.id == record_id,
            PregnancyRecord.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="임신 기록을 찾을 수 없습니다."
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    # 임신 주차 계산
    if record.conception_date and update_data.current_week is None:
        days_since_conception = (date.today() - record.conception_date).days
        record.current_week = days_since_conception // 7
        record.current_trimester = (record.current_week // 13) + 1 if record.current_week < 40 else 3

    await db.commit()
    await db.refresh(record)

    return record


# ========== 태교 기록 관리 ==========

@router.post("/prenatal-care", response_model=PrenatalCareResponse, status_code=status.HTTP_201_CREATED)
async def create_prenatal_care(
    care_data: PrenatalCareCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """태교 기록 생성"""

    new_care = PrenatalCare(
        pregnancy_record_id=care_data.pregnancy_record_id,
        user_id=current_user.id,
        care_type=care_data.care_type,
        title=care_data.title,
        description=care_data.description,
        duration_minutes=care_data.duration_minutes,
        music_title=care_data.music_title,
        music_genre=care_data.music_genre,
        music_url=care_data.music_url,
        talking_content=care_data.talking_content,
        voice_recording_url=care_data.voice_recording_url,
        fetal_movement_count=care_data.fetal_movement_count,
        fetal_movement_strength=care_data.fetal_movement_strength,
        mother_mood=care_data.mother_mood,
        baby_response=care_data.baby_response,
        image_url=care_data.image_url,
        notes=care_data.notes,
    )

    db.add(new_care)
    await db.commit()
    await db.refresh(new_care)

    return new_care


@router.get("/prenatal-care", response_model=List[PrenatalCareResponse])
async def get_prenatal_cares(
    pregnancy_record_id: int,
    care_type: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """태교 기록 목록 조회"""

    query = (
        select(PrenatalCare)
        .where(
            and_(
                PrenatalCare.pregnancy_record_id == pregnancy_record_id,
                PrenatalCare.user_id == current_user.id
            )
        )
    )

    if care_type:
        query = query.where(PrenatalCare.care_type == care_type)

    query = query.order_by(PrenatalCare.care_date.desc()).limit(limit)

    result = await db.execute(query)
    cares = result.scalars().all()

    return cares


# ========== 임신 일지 관리 ==========

@router.post("/logs", response_model=PregnancyLogResponse, status_code=status.HTTP_201_CREATED)
async def create_pregnancy_log(
    log_data: PregnancyLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """임신 일지 생성"""

    new_log = PregnancyLog(
        pregnancy_record_id=log_data.pregnancy_record_id,
        user_id=current_user.id,
        log_date=log_data.log_date,
        pregnancy_week=log_data.pregnancy_week,
        weight=log_data.weight,
        blood_pressure=log_data.blood_pressure,
        temperature=log_data.temperature,
        symptoms=log_data.symptoms,
        nausea_level=log_data.nausea_level,
        fatigue_level=log_data.fatigue_level,
        pain_level=log_data.pain_level,
        exercise_type=log_data.exercise_type,
        exercise_duration=log_data.exercise_duration,
        sleep_hours=log_data.sleep_hours,
        meals=log_data.meals,
        water_intake=log_data.water_intake,
        mood=log_data.mood,
        stress_level=log_data.stress_level,
        fetal_movement_count=log_data.fetal_movement_count,
        notes=log_data.notes,
    )

    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)

    return new_log


@router.get("/logs", response_model=List[PregnancyLogResponse])
async def get_pregnancy_logs(
    pregnancy_record_id: int,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """임신 일지 목록 조회"""

    query = (
        select(PregnancyLog)
        .where(
            and_(
                PregnancyLog.pregnancy_record_id == pregnancy_record_id,
                PregnancyLog.user_id == current_user.id
            )
        )
    )

    if start_date:
        start = datetime.fromisoformat(start_date.replace("Z", "+00:00")).date()
        query = query.where(PregnancyLog.log_date >= start)

    if end_date:
        end = datetime.fromisoformat(end_date.replace("Z", "+00:00")).date()
        query = query.where(PregnancyLog.log_date <= end)

    query = query.order_by(PregnancyLog.log_date.desc()).limit(limit)

    result = await db.execute(query)
    logs = result.scalars().all()

    return logs


# ========== 산후조리 관리 ==========

@router.post("/postpartum", response_model=PostpartumCareResponse, status_code=status.HTTP_201_CREATED)
async def create_postpartum_care(
    care_data: PostpartumCareCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """산후조리 기록 생성"""

    days_after = (date.today() - care_data.birth_date).days

    new_care = PostpartumCare(
        user_id=current_user.id,
        birth_date=care_data.birth_date,
        days_after_birth=days_after,
        care_type=care_data.care_type,
        care_center_name=care_data.care_center_name,
        care_start_date=care_data.care_start_date,
        care_end_date=care_data.care_end_date,
    )

    db.add(new_care)
    await db.commit()
    await db.refresh(new_care)

    return new_care


@router.get("/postpartum", response_model=List[PostpartumCareResponse])
async def get_postpartum_cares(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """산후조리 기록 목록 조회"""

    query = (
        select(PostpartumCare)
        .where(PostpartumCare.user_id == current_user.id)
        .order_by(PostpartumCare.birth_date.desc())
    )

    result = await db.execute(query)
    cares = result.scalars().all()

    return cares


@router.patch("/postpartum/{care_id}", response_model=PostpartumCareResponse)
async def update_postpartum_care(
    care_id: int,
    update_data: PostpartumCareUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """산후조리 기록 업데이트"""

    query = select(PostpartumCare).where(
        and_(
            PostpartumCare.id == care_id,
            PostpartumCare.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    care = result.scalar_one_or_none()

    if not care:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="산후조리 기록을 찾을 수 없습니다."
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(care, field, value)

    # 산후우울증 위험도 평가
    if care.depression_screening_score:
        if care.depression_screening_score >= 13:
            care.postpartum_depression_risk = "high"
        elif care.depression_screening_score >= 10:
            care.postpartum_depression_risk = "medium"
        else:
            care.postpartum_depression_risk = "low"

    await db.commit()
    await db.refresh(care)

    return care


# ========== 육아 관리 (자녀 기록) ==========

@router.post("/children", response_model=ChildDevelopmentResponse, status_code=status.HTTP_201_CREATED)
async def create_child_record(
    child_data: ChildDevelopmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """자녀 기록 생성"""

    # 나이 계산 (개월)
    age_months = ((date.today() - child_data.birth_date).days) // 30

    # 발달 단계 결정
    if age_months < 12:
        stage = "infant"
    elif age_months < 36:
        stage = "toddler"
    elif age_months < 72:
        stage = "preschool"
    else:
        stage = "school_age"

    new_child = ChildDevelopment(
        user_id=current_user.id,
        child_name=child_data.child_name,
        child_gender=child_data.child_gender,
        birth_date=child_data.birth_date,
        birth_weight=child_data.birth_weight,
        birth_height=child_data.birth_height,
        current_age_months=age_months,
        developmental_stage=stage,
    )

    db.add(new_child)
    await db.commit()
    await db.refresh(new_child)

    return new_child


@router.get("/children", response_model=List[ChildDevelopmentResponse])
async def get_children(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """자녀 목록 조회"""

    query = (
        select(ChildDevelopment)
        .where(ChildDevelopment.user_id == current_user.id)
        .order_by(ChildDevelopment.birth_date.desc())
    )

    result = await db.execute(query)
    children = result.scalars().all()

    return children


@router.patch("/children/{child_id}", response_model=ChildDevelopmentResponse)
async def update_child_record(
    child_id: int,
    update_data: ChildDevelopmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """자녀 기록 업데이트"""

    query = select(ChildDevelopment).where(
        and_(
            ChildDevelopment.id == child_id,
            ChildDevelopment.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    child = result.scalar_one_or_none()

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="자녀 기록을 찾을 수 없습니다."
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(child, field, value)

    await db.commit()
    await db.refresh(child)

    return child


# ========== 성장 기록 ==========

@router.post("/growth-records", response_model=GrowthRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_growth_record(
    record_data: GrowthRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """성장 기록 생성"""

    # BMI 계산
    bmi = record_data.weight / ((record_data.height / 100) ** 2)

    new_record = GrowthRecord(
        child_id=record_data.child_id,
        user_id=current_user.id,
        measurement_date=record_data.measurement_date,
        age_months=record_data.age_months,
        weight=record_data.weight,
        height=record_data.height,
        head_circumference=record_data.head_circumference,
        bmi=round(bmi, 2),
        notes=record_data.notes,
    )

    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)

    return new_record


@router.get("/growth-records/{child_id}", response_model=List[GrowthRecordResponse])
async def get_growth_records(
    child_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """성장 기록 목록 조회"""

    query = (
        select(GrowthRecord)
        .where(
            and_(
                GrowthRecord.child_id == child_id,
                GrowthRecord.user_id == current_user.id
            )
        )
        .order_by(GrowthRecord.measurement_date.desc())
    )

    result = await db.execute(query)
    records = result.scalars().all()

    return records


# ========== 발달 일지 ==========

@router.post("/development-logs", response_model=DevelopmentLogResponse, status_code=status.HTTP_201_CREATED)
async def create_development_log(
    log_data: DevelopmentLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """발달 일지 생성"""

    new_log = DevelopmentLog(
        child_id=log_data.child_id,
        user_id=current_user.id,
        log_date=log_data.log_date,
        age_months=log_data.age_months,
        motor_skills=log_data.motor_skills,
        language_skills=log_data.language_skills,
        cognitive_skills=log_data.cognitive_skills,
        social_skills=log_data.social_skills,
        emotional_skills=log_data.emotional_skills,
        eating_habits=log_data.eating_habits,
        sleep_pattern=log_data.sleep_pattern,
        sleep_hours=log_data.sleep_hours,
        play_activities=log_data.play_activities,
        mood=log_data.mood,
        special_moments=log_data.special_moments,
        photos=log_data.photos,
        notes=log_data.notes,
    )

    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)

    return new_log


@router.get("/development-logs/{child_id}", response_model=List[DevelopmentLogResponse])
async def get_development_logs(
    child_id: int,
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """발달 일지 목록 조회"""

    query = (
        select(DevelopmentLog)
        .where(
            and_(
                DevelopmentLog.child_id == child_id,
                DevelopmentLog.user_id == current_user.id
            )
        )
        .order_by(DevelopmentLog.log_date.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    logs = result.scalars().all()

    return logs


# ========== 예방접종 ==========

@router.post("/vaccinations", response_model=VaccinationResponse, status_code=status.HTTP_201_CREATED)
async def create_vaccination(
    vaccination_data: VaccinationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """예방접종 기록 생성"""

    new_vaccination = Vaccination(
        child_id=vaccination_data.child_id,
        user_id=current_user.id,
        vaccine_name=vaccination_data.vaccine_name,
        vaccine_type=vaccination_data.vaccine_type,
        dose_number=vaccination_data.dose_number,
        scheduled_date=vaccination_data.scheduled_date,
        actual_date=vaccination_data.actual_date,
        hospital_name=vaccination_data.hospital_name,
        notes=vaccination_data.notes,
    )

    if vaccination_data.actual_date:
        new_vaccination.is_completed = True

    db.add(new_vaccination)
    await db.commit()
    await db.refresh(new_vaccination)

    return new_vaccination


@router.get("/vaccinations/{child_id}", response_model=List[VaccinationResponse])
async def get_vaccinations(
    child_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """예방접종 기록 목록 조회"""

    query = (
        select(Vaccination)
        .where(
            and_(
                Vaccination.child_id == child_id,
                Vaccination.user_id == current_user.id
            )
        )
        .order_by(Vaccination.scheduled_date.desc())
    )

    result = await db.execute(query)
    vaccinations = result.scalars().all()

    return vaccinations


@router.patch("/vaccinations/{vaccination_id}", response_model=VaccinationResponse)
async def update_vaccination(
    vaccination_id: int,
    update_data: VaccinationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """예방접종 기록 업데이트"""

    query = select(Vaccination).where(
        and_(
            Vaccination.id == vaccination_id,
            Vaccination.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    vaccination = result.scalar_one_or_none()

    if not vaccination:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="예방접종 기록을 찾을 수 없습니다."
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(vaccination, field, value)

    await db.commit()
    await db.refresh(vaccination)

    return vaccination


# ========== 건강검진 ==========

@router.post("/health-checkups", response_model=HealthCheckupResponse, status_code=status.HTTP_201_CREATED)
async def create_health_checkup(
    checkup_data: HealthCheckupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """건강검진 기록 생성"""

    new_checkup = HealthCheckup(
        user_id=current_user.id,
        child_id=checkup_data.child_id,
        checkup_type=checkup_data.checkup_type,
        checkup_name=checkup_data.checkup_name,
        scheduled_date=checkup_data.scheduled_date,
        hospital_name=checkup_data.hospital_name,
    )

    db.add(new_checkup)
    await db.commit()
    await db.refresh(new_checkup)

    return new_checkup


@router.get("/health-checkups", response_model=List[HealthCheckupResponse])
async def get_health_checkups(
    child_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """건강검진 기록 목록 조회"""

    query = select(HealthCheckup).where(HealthCheckup.user_id == current_user.id)

    if child_id is not None:
        query = query.where(HealthCheckup.child_id == child_id)

    query = query.order_by(HealthCheckup.scheduled_date.desc())

    result = await db.execute(query)
    checkups = result.scalars().all()

    return checkups


@router.patch("/health-checkups/{checkup_id}", response_model=HealthCheckupResponse)
async def update_health_checkup(
    checkup_id: int,
    update_data: HealthCheckupUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """건강검진 기록 업데이트"""

    query = select(HealthCheckup).where(
        and_(
            HealthCheckup.id == checkup_id,
            HealthCheckup.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    checkup = result.scalar_one_or_none()

    if not checkup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="건강검진 기록을 찾을 수 없습니다."
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(checkup, field, value)

    await db.commit()
    await db.refresh(checkup)

    return checkup
