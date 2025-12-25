from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


# ========== DiseaseRecord Schemas ==========

class DiseaseRecordCreate(BaseModel):
    """질병 기록 생성 스키마"""
    disease_name: str
    disease_code: Optional[str] = None
    severity: str  # mild, moderate, severe, critical
    diagnosis_date: datetime
    symptoms: Optional[List[str]] = None
    current_status: Optional[str] = None
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    treatment_method: Optional[str] = None
    medications: Optional[List[str]] = None
    precautions: Optional[str] = None
    notes: Optional[str] = None


class DiseaseRecordUpdate(BaseModel):
    """질병 기록 업데이트 스키마"""
    disease_name: Optional[str] = None
    disease_code: Optional[str] = None
    severity: Optional[str] = None
    diagnosis_date: Optional[datetime] = None
    symptoms: Optional[List[str]] = None
    current_status: Optional[str] = None
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    treatment_method: Optional[str] = None
    medications: Optional[List[str]] = None
    precautions: Optional[str] = None
    improvement_score: Optional[float] = None
    notes: Optional[str] = None


class DiseaseRecordResponse(BaseModel):
    """질병 기록 응답 스키마"""
    id: int
    user_id: int
    disease_name: str
    disease_code: Optional[str]
    severity: str
    diagnosis_date: datetime
    symptoms: Optional[List[str]]
    current_status: Optional[str]
    doctor_name: Optional[str]
    hospital_name: Optional[str]
    treatment_method: Optional[str]
    medications: Optional[List[str]]
    precautions: Optional[str]
    improvement_score: float
    notes: Optional[str]
    ai_analysis: Optional[str]
    ai_recommendations: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== TreatmentPlan Schemas ==========

class TreatmentPlanCreate(BaseModel):
    """치료 계획 생성 스키마"""
    disease_record_id: int
    plan_name: str
    duration: str  # 3_months, 6_months, 12_months
    start_date: datetime
    end_date: datetime
    goals: List[str]
    milestones: Optional[List[Dict[str, Any]]] = None
    daily_tasks: Optional[List[str]] = None
    weekly_tasks: Optional[List[str]] = None
    monthly_tasks: Optional[List[str]] = None


class TreatmentPlanUpdate(BaseModel):
    """치료 계획 업데이트 스키마"""
    plan_name: Optional[str] = None
    goals: Optional[List[str]] = None
    milestones: Optional[List[Dict[str, Any]]] = None
    daily_tasks: Optional[List[str]] = None
    weekly_tasks: Optional[List[str]] = None
    monthly_tasks: Optional[List[str]] = None
    completion_percentage: Optional[float] = None
    is_active: Optional[bool] = None


class TreatmentPlanResponse(BaseModel):
    """치료 계획 응답 스키마"""
    id: int
    disease_record_id: int
    user_id: int
    plan_name: str
    duration: str
    start_date: datetime
    end_date: datetime
    goals: List[str]
    milestones: Optional[List[Dict[str, Any]]]
    daily_tasks: Optional[List[str]]
    weekly_tasks: Optional[List[str]]
    monthly_tasks: Optional[List[str]]
    completion_percentage: float
    is_active: bool
    ai_generated: bool
    ai_recommendations: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== DiseaseChecklist Schemas ==========

class ChecklistItemCreate(BaseModel):
    """체크리스트 항목 스키마"""
    title: str
    completed: bool = False


class DiseaseChecklistCreate(BaseModel):
    """질병 체크리스트 생성 스키마"""
    disease_record_id: int
    title: str
    description: Optional[str] = None
    checklist_date: datetime
    items: List[Dict[str, Any]]  # [{"title": "...", "completed": false}, ...]


class DiseaseChecklistUpdate(BaseModel):
    """질병 체크리스트 업데이트 스키마"""
    title: Optional[str] = None
    description: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None


class DiseaseChecklistResponse(BaseModel):
    """질병 체크리스트 응답 스키마"""
    id: int
    disease_record_id: int
    user_id: int
    title: str
    description: Optional[str]
    checklist_date: datetime
    items: List[Dict[str, Any]]
    completed_count: int
    total_count: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== DiseaseProgressLog Schemas ==========

class DiseaseProgressLogCreate(BaseModel):
    """질병 진행 상황 로그 생성 스키마"""
    disease_record_id: int
    improvement_score: float  # 0-100
    symptoms_severity: Optional[Dict[str, int]] = None  # {"증상명": 심각도}
    pain_level: Optional[int] = None  # 0-10
    activity_level: Optional[str] = None
    energy_level: Optional[int] = None  # 0-10
    notes: Optional[str] = None


class DiseaseProgressLogResponse(BaseModel):
    """질병 진행 상황 로그 응답 스키마"""
    id: int
    disease_record_id: int
    user_id: int
    log_date: datetime
    improvement_score: float
    symptoms_severity: Optional[Dict[str, int]]
    pain_level: Optional[int]
    activity_level: Optional[str]
    energy_level: Optional[int]
    notes: Optional[str]
    ai_analysis: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ========== AI 생성 치료 계획 요청 ==========

class GenerateTreatmentPlanRequest(BaseModel):
    """AI 치료 계획 생성 요청 스키마"""
    disease_record_id: int
    duration: str  # 3_months, 6_months, 12_months
    patient_preferences: Optional[str] = None
    focus_areas: Optional[List[str]] = None
