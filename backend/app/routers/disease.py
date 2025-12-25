from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from ..database import get_db
from ..models.user import User
from ..models.disease import (
    DiseaseRecord,
    TreatmentPlan,
    DiseaseChecklist,
    DiseaseProgressLog
)
from ..schemas.disease import (
    DiseaseRecordCreate,
    DiseaseRecordUpdate,
    DiseaseRecordResponse,
    TreatmentPlanCreate,
    TreatmentPlanUpdate,
    TreatmentPlanResponse,
    DiseaseChecklistCreate,
    DiseaseChecklistUpdate,
    DiseaseChecklistResponse,
    DiseaseProgressLogCreate,
    DiseaseProgressLogResponse,
    GenerateTreatmentPlanRequest
)
from ..dependencies import get_current_user
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/disease", tags=["disease"])


# ========== 질병 기록 관리 ==========

@router.post("/records", response_model=DiseaseRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_disease_record(
    record_data: DiseaseRecordCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """질병 기록 생성"""

    new_record = DiseaseRecord(
        user_id=current_user.id,
        disease_name=record_data.disease_name,
        disease_code=record_data.disease_code,
        severity=record_data.severity,
        diagnosis_date=record_data.diagnosis_date,
        symptoms=record_data.symptoms,
        current_status=record_data.current_status,
        doctor_name=record_data.doctor_name,
        hospital_name=record_data.hospital_name,
        treatment_method=record_data.treatment_method,
        medications=record_data.medications,
        precautions=record_data.precautions,
        notes=record_data.notes,
    )

    db.add(new_record)
    await db.commit()
    await db.refresh(new_record)

    return new_record


@router.get("/records", response_model=List[DiseaseRecordResponse])
async def get_disease_records(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """모든 질병 기록 조회"""

    query = (
        select(DiseaseRecord)
        .where(DiseaseRecord.user_id == current_user.id)
        .order_by(DiseaseRecord.diagnosis_date.desc())
    )

    result = await db.execute(query)
    records = result.scalars().all()

    return records


@router.get("/records/{record_id}", response_model=DiseaseRecordResponse)
async def get_disease_record(
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """특정 질병 기록 조회"""

    query = select(DiseaseRecord).where(
        and_(
            DiseaseRecord.id == record_id,
            DiseaseRecord.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="질병 기록을 찾을 수 없습니다."
        )

    return record


@router.patch("/records/{record_id}", response_model=DiseaseRecordResponse)
async def update_disease_record(
    record_id: int,
    update_data: DiseaseRecordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """질병 기록 업데이트"""

    query = select(DiseaseRecord).where(
        and_(
            DiseaseRecord.id == record_id,
            DiseaseRecord.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="질병 기록을 찾을 수 없습니다."
        )

    # 업데이트할 필드만 적용
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    await db.commit()
    await db.refresh(record)

    return record


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_disease_record(
    record_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """질병 기록 삭제"""

    query = select(DiseaseRecord).where(
        and_(
            DiseaseRecord.id == record_id,
            DiseaseRecord.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="질병 기록을 찾을 수 없습니다."
        )

    await db.delete(record)
    await db.commit()

    return None


# ========== 치료 계획 관리 ==========

@router.post("/treatment-plans", response_model=TreatmentPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_treatment_plan(
    plan_data: TreatmentPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """치료 계획 생성"""

    # 질병 기록 확인
    disease_query = select(DiseaseRecord).where(
        and_(
            DiseaseRecord.id == plan_data.disease_record_id,
            DiseaseRecord.user_id == current_user.id
        )
    )
    result = await db.execute(disease_query)
    disease_record = result.scalar_one_or_none()

    if not disease_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="질병 기록을 찾을 수 없습니다."
        )

    new_plan = TreatmentPlan(
        disease_record_id=plan_data.disease_record_id,
        user_id=current_user.id,
        plan_name=plan_data.plan_name,
        duration=plan_data.duration,
        start_date=plan_data.start_date,
        end_date=plan_data.end_date,
        goals=plan_data.goals,
        milestones=plan_data.milestones,
        daily_tasks=plan_data.daily_tasks,
        weekly_tasks=plan_data.weekly_tasks,
        monthly_tasks=plan_data.monthly_tasks,
    )

    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)

    return new_plan


@router.get("/treatment-plans", response_model=List[TreatmentPlanResponse])
async def get_treatment_plans(
    disease_record_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """치료 계획 목록 조회"""

    query = select(TreatmentPlan).where(TreatmentPlan.user_id == current_user.id)

    if disease_record_id:
        query = query.where(TreatmentPlan.disease_record_id == disease_record_id)

    if is_active is not None:
        query = query.where(TreatmentPlan.is_active == is_active)

    query = query.order_by(TreatmentPlan.created_at.desc())

    result = await db.execute(query)
    plans = result.scalars().all()

    return plans


@router.patch("/treatment-plans/{plan_id}", response_model=TreatmentPlanResponse)
async def update_treatment_plan(
    plan_id: int,
    update_data: TreatmentPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """치료 계획 업데이트"""

    query = select(TreatmentPlan).where(
        and_(
            TreatmentPlan.id == plan_id,
            TreatmentPlan.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="치료 계획을 찾을 수 없습니다."
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)

    await db.commit()
    await db.refresh(plan)

    return plan


@router.delete("/treatment-plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_treatment_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """치료 계획 삭제"""

    query = select(TreatmentPlan).where(
        and_(
            TreatmentPlan.id == plan_id,
            TreatmentPlan.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="치료 계획을 찾을 수 없습니다."
        )

    await db.delete(plan)
    await db.commit()

    return None


# ========== 체크리스트 관리 ==========

@router.post("/checklists", response_model=DiseaseChecklistResponse, status_code=status.HTTP_201_CREATED)
async def create_disease_checklist(
    checklist_data: DiseaseChecklistCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """질병 체크리스트 생성"""

    total_count = len(checklist_data.items)
    completed_count = sum(1 for item in checklist_data.items if item.get("completed", False))

    new_checklist = DiseaseChecklist(
        disease_record_id=checklist_data.disease_record_id,
        user_id=current_user.id,
        title=checklist_data.title,
        description=checklist_data.description,
        checklist_date=checklist_data.checklist_date,
        items=checklist_data.items,
        total_count=total_count,
        completed_count=completed_count,
        is_completed=(completed_count == total_count and total_count > 0),
    )

    db.add(new_checklist)
    await db.commit()
    await db.refresh(new_checklist)

    return new_checklist


@router.get("/checklists", response_model=List[DiseaseChecklistResponse])
async def get_disease_checklists(
    disease_record_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """질병 체크리스트 목록 조회"""

    query = select(DiseaseChecklist).where(DiseaseChecklist.user_id == current_user.id)

    if disease_record_id:
        query = query.where(DiseaseChecklist.disease_record_id == disease_record_id)

    if start_date:
        start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        query = query.where(DiseaseChecklist.checklist_date >= start)

    if end_date:
        end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
        query = query.where(DiseaseChecklist.checklist_date <= end)

    query = query.order_by(DiseaseChecklist.checklist_date.desc())

    result = await db.execute(query)
    checklists = result.scalars().all()

    return checklists


@router.patch("/checklists/{checklist_id}", response_model=DiseaseChecklistResponse)
async def update_disease_checklist(
    checklist_id: int,
    update_data: DiseaseChecklistUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """질병 체크리스트 업데이트"""

    query = select(DiseaseChecklist).where(
        and_(
            DiseaseChecklist.id == checklist_id,
            DiseaseChecklist.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    checklist = result.scalar_one_or_none()

    if not checklist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="체크리스트를 찾을 수 없습니다."
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(checklist, field, value)

    # 완료 상태 업데이트
    if checklist.items:
        checklist.total_count = len(checklist.items)
        checklist.completed_count = sum(1 for item in checklist.items if item.get("completed", False))
        checklist.is_completed = (checklist.completed_count == checklist.total_count and checklist.total_count > 0)

    await db.commit()
    await db.refresh(checklist)

    return checklist


@router.delete("/checklists/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_disease_checklist(
    checklist_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """질병 체크리스트 삭제"""

    query = select(DiseaseChecklist).where(
        and_(
            DiseaseChecklist.id == checklist_id,
            DiseaseChecklist.user_id == current_user.id
        )
    )

    result = await db.execute(query)
    checklist = result.scalar_one_or_none()

    if not checklist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="체크리스트를 찾을 수 없습니다."
        )

    await db.delete(checklist)
    await db.commit()

    return None


# ========== 진행 상황 로그 관리 ==========

@router.post("/progress-logs", response_model=DiseaseProgressLogResponse, status_code=status.HTTP_201_CREATED)
async def create_progress_log(
    log_data: DiseaseProgressLogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """진행 상황 로그 생성"""

    new_log = DiseaseProgressLog(
        disease_record_id=log_data.disease_record_id,
        user_id=current_user.id,
        improvement_score=log_data.improvement_score,
        symptoms_severity=log_data.symptoms_severity,
        pain_level=log_data.pain_level,
        activity_level=log_data.activity_level,
        energy_level=log_data.energy_level,
        notes=log_data.notes,
    )

    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)

    # 질병 기록의 호전도 점수도 업데이트
    disease_query = select(DiseaseRecord).where(
        and_(
            DiseaseRecord.id == log_data.disease_record_id,
            DiseaseRecord.user_id == current_user.id
        )
    )
    disease_result = await db.execute(disease_query)
    disease_record = disease_result.scalar_one_or_none()

    if disease_record:
        disease_record.improvement_score = log_data.improvement_score
        await db.commit()

    return new_log


@router.get("/progress-logs", response_model=List[DiseaseProgressLogResponse])
async def get_progress_logs(
    disease_record_id: int,
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """진행 상황 로그 목록 조회"""

    start_date = datetime.utcnow() - timedelta(days=days)

    query = (
        select(DiseaseProgressLog)
        .where(
            and_(
                DiseaseProgressLog.disease_record_id == disease_record_id,
                DiseaseProgressLog.user_id == current_user.id,
                DiseaseProgressLog.log_date >= start_date
            )
        )
        .order_by(DiseaseProgressLog.log_date.desc())
    )

    result = await db.execute(query)
    logs = result.scalars().all()

    return logs


@router.get("/progress-logs/statistics")
async def get_progress_statistics(
    disease_record_id: int,
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """진행 상황 통계 조회"""

    start_date = datetime.utcnow() - timedelta(days=days)

    query = (
        select(DiseaseProgressLog)
        .where(
            and_(
                DiseaseProgressLog.disease_record_id == disease_record_id,
                DiseaseProgressLog.user_id == current_user.id,
                DiseaseProgressLog.log_date >= start_date
            )
        )
        .order_by(DiseaseProgressLog.log_date.asc())
    )

    result = await db.execute(query)
    logs = result.scalars().all()

    if not logs:
        return {
            "count": 0,
            "average_improvement": 0,
            "trend": "없음",
            "latest_score": 0,
        }

    scores = [log.improvement_score for log in logs]
    avg_improvement = sum(scores) / len(scores)

    # 추세 계산 (최근 점수 vs 평균 점수)
    latest_score = scores[-1] if scores else 0
    if latest_score > avg_improvement + 10:
        trend = "상승"
    elif latest_score < avg_improvement - 10:
        trend = "하락"
    else:
        trend = "안정"

    return {
        "count": len(logs),
        "average_improvement": round(avg_improvement, 2),
        "trend": trend,
        "latest_score": latest_score,
        "scores_history": [{"date": log.log_date.isoformat(), "score": log.improvement_score} for log in logs]
    }


# ========== AI 치료 계획 생성 (placeholder) ==========

@router.post("/generate-treatment-plan", response_model=TreatmentPlanResponse)
async def generate_treatment_plan_with_ai(
    request: GenerateTreatmentPlanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI 기반 치료 계획 생성 (placeholder - 실제 AI 연동 필요)"""

    # 질병 기록 조회
    disease_query = select(DiseaseRecord).where(
        and_(
            DiseaseRecord.id == request.disease_record_id,
            DiseaseRecord.user_id == current_user.id
        )
    )
    result = await db.execute(disease_query)
    disease_record = result.scalar_one_or_none()

    if not disease_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="질병 기록을 찾을 수 없습니다."
        )

    # 기간에 따른 종료일 계산
    duration_days = {
        "3_months": 90,
        "6_months": 180,
        "12_months": 365
    }

    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=duration_days.get(request.duration, 90))

    # AI 생성 치료 계획 (실제로는 AI API 호출)
    # 여기서는 템플릿 기반 계획 생성
    plan_name = f"{disease_record.disease_name} 치료 계획 ({request.duration})"

    # 기본 목표 설정
    goals = [
        "증상 완화 및 관리",
        "삶의 질 향상",
        "합병증 예방",
        "정기적인 모니터링"
    ]

    # 기본 일일 과제
    daily_tasks = [
        "증상 기록하기",
        "처방된 약물 복용",
        "적절한 휴식 취하기",
        "건강한 식단 유지"
    ]

    new_plan = TreatmentPlan(
        disease_record_id=request.disease_record_id,
        user_id=current_user.id,
        plan_name=plan_name,
        duration=request.duration,
        start_date=start_date,
        end_date=end_date,
        goals=goals,
        daily_tasks=daily_tasks,
        ai_generated=True,
        ai_recommendations="AI 기반 맞춤 치료 계획입니다. 의사와 상담 후 조정이 필요할 수 있습니다."
    )

    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)

    return new_plan
