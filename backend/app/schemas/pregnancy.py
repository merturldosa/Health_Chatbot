from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date


# ========== PregnancyRecord Schemas ==========

class PregnancyRecordCreate(BaseModel):
    """임신 기록 생성 스키마"""
    pregnancy_status: str  # preparing, pregnant, postpartum, completed
    conception_date: Optional[date] = None
    due_date: Optional[date] = None
    pre_pregnancy_checkup_date: Optional[date] = None
    pre_pregnancy_notes: Optional[str] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    baby_name: Optional[str] = None
    number_of_babies: int = 1


class PregnancyRecordUpdate(BaseModel):
    """임신 기록 업데이트 스키마"""
    pregnancy_status: Optional[str] = None
    current_week: Optional[int] = None
    current_weight: Optional[float] = None
    blood_pressure: Optional[str] = None
    blood_sugar: Optional[float] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    next_checkup_date: Optional[date] = None
    baby_gender: Optional[str] = None
    baby_name: Optional[str] = None
    symptoms: Optional[List[str]] = None
    mood_status: Optional[str] = None
    energy_level: Optional[int] = None
    notes: Optional[str] = None
    actual_birth_date: Optional[date] = None


class PregnancyRecordResponse(BaseModel):
    """임신 기록 응답 스키마"""
    id: int
    user_id: int
    pregnancy_status: str
    conception_date: Optional[date]
    due_date: Optional[date]
    actual_birth_date: Optional[date]
    current_week: Optional[int]
    current_trimester: Optional[int]
    weight_before_pregnancy: Optional[float]
    current_weight: Optional[float]
    blood_pressure: Optional[str]
    blood_sugar: Optional[float]
    hospital_name: Optional[str]
    doctor_name: Optional[str]
    next_checkup_date: Optional[date]
    baby_gender: Optional[str]
    baby_name: Optional[str]
    number_of_babies: int
    symptoms: Optional[List[str]]
    mood_status: Optional[str]
    energy_level: Optional[int]
    ai_analysis: Optional[str]
    ai_recommendations: Optional[str]
    risk_level: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== PrenatalCare Schemas ==========

class PrenatalCareCreate(BaseModel):
    """태교 기록 생성 스키마"""
    pregnancy_record_id: int
    care_type: str  # music, talking, reading, movement, other
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    music_title: Optional[str] = None
    music_genre: Optional[str] = None
    music_url: Optional[str] = None
    talking_content: Optional[str] = None
    voice_recording_url: Optional[str] = None
    fetal_movement_count: Optional[int] = None
    fetal_movement_strength: Optional[str] = None
    mother_mood: Optional[str] = None
    baby_response: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None


class PrenatalCareResponse(BaseModel):
    """태교 기록 응답 스키마"""
    id: int
    pregnancy_record_id: int
    user_id: int
    care_date: datetime
    care_type: str
    title: Optional[str]
    description: Optional[str]
    duration_minutes: Optional[int]
    music_title: Optional[str]
    talking_content: Optional[str]
    fetal_movement_count: Optional[int]
    mother_mood: Optional[str]
    image_url: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ========== PregnancyLog Schemas ==========

class PregnancyLogCreate(BaseModel):
    """임신 일지 생성 스키마"""
    pregnancy_record_id: int
    log_date: date
    pregnancy_week: Optional[int] = None
    weight: Optional[float] = None
    blood_pressure: Optional[str] = None
    temperature: Optional[float] = None
    symptoms: Optional[List[str]] = None
    nausea_level: Optional[int] = None
    fatigue_level: Optional[int] = None
    pain_level: Optional[int] = None
    exercise_type: Optional[str] = None
    exercise_duration: Optional[int] = None
    sleep_hours: Optional[float] = None
    meals: Optional[List[Dict[str, Any]]] = None
    water_intake: Optional[float] = None
    mood: Optional[str] = None
    stress_level: Optional[int] = None
    fetal_movement_count: Optional[int] = None
    notes: Optional[str] = None


class PregnancyLogResponse(BaseModel):
    """임신 일지 응답 스키마"""
    id: int
    pregnancy_record_id: int
    user_id: int
    log_date: date
    pregnancy_week: Optional[int]
    weight: Optional[float]
    symptoms: Optional[List[str]]
    mood: Optional[str]
    fetal_movement_count: Optional[int]
    ai_analysis: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ========== PostpartumCare Schemas ==========

class PostpartumCareCreate(BaseModel):
    """산후조리 기록 생성 스키마"""
    birth_date: date
    care_type: Optional[str] = None  # home, postpartum_center
    care_center_name: Optional[str] = None
    care_start_date: Optional[date] = None
    care_end_date: Optional[date] = None


class PostpartumCareUpdate(BaseModel):
    """산후조리 기록 업데이트 스키마"""
    days_after_birth: Optional[int] = None
    physical_recovery_score: Optional[int] = None
    pain_level: Optional[int] = None
    bleeding_status: Optional[str] = None
    breastfeeding_status: Optional[str] = None
    milk_supply: Optional[str] = None
    mood_score: Optional[int] = None
    depression_screening_score: Optional[int] = None
    anxiety_level: Optional[int] = None
    symptoms: Optional[List[str]] = None
    notes: Optional[str] = None


class PostpartumCareResponse(BaseModel):
    """산후조리 기록 응답 스키마"""
    id: int
    user_id: int
    birth_date: date
    days_after_birth: Optional[int]
    care_type: Optional[str]
    physical_recovery_score: Optional[int]
    breastfeeding_status: Optional[str]
    mood_score: Optional[int]
    depression_screening_score: Optional[int]
    postpartum_depression_risk: Optional[str]
    ai_analysis: Optional[str]
    ai_recommendations: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== ChildDevelopment Schemas ==========

class ChildDevelopmentCreate(BaseModel):
    """육아 기록 생성 스키마"""
    child_name: str
    child_gender: Optional[str] = None
    birth_date: date
    birth_weight: Optional[float] = None
    birth_height: Optional[float] = None


class ChildDevelopmentUpdate(BaseModel):
    """육아 기록 업데이트 스키마"""
    child_name: Optional[str] = None
    current_weight: Optional[float] = None
    current_height: Optional[float] = None
    current_head_circumference: Optional[float] = None
    milestones_achieved: Optional[List[Dict[str, Any]]] = None
    health_conditions: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    profile_image_url: Optional[str] = None
    notes: Optional[str] = None


class ChildDevelopmentResponse(BaseModel):
    """육아 기록 응답 스키마"""
    id: int
    user_id: int
    child_name: str
    child_gender: Optional[str]
    birth_date: date
    birth_weight: Optional[float]
    birth_height: Optional[float]
    current_age_months: Optional[int]
    current_weight: Optional[float]
    current_height: Optional[float]
    developmental_stage: Optional[str]
    milestones_achieved: Optional[List[Dict[str, Any]]]
    health_conditions: Optional[List[str]]
    allergies: Optional[List[str]]
    profile_image_url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== GrowthRecord Schemas ==========

class GrowthRecordCreate(BaseModel):
    """성장 기록 생성 스키마"""
    child_id: int
    measurement_date: date
    age_months: Optional[int] = None
    weight: float
    height: float
    head_circumference: Optional[float] = None
    notes: Optional[str] = None


class GrowthRecordResponse(BaseModel):
    """성장 기록 응답 스키마"""
    id: int
    child_id: int
    user_id: int
    measurement_date: date
    age_months: Optional[int]
    weight: float
    height: float
    head_circumference: Optional[float]
    bmi: Optional[float]
    weight_percentile: Optional[float]
    height_percentile: Optional[float]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ========== DevelopmentLog Schemas ==========

class DevelopmentLogCreate(BaseModel):
    """발달 일지 생성 스키마"""
    child_id: int
    log_date: date
    age_months: Optional[int] = None
    motor_skills: Optional[str] = None
    language_skills: Optional[str] = None
    cognitive_skills: Optional[str] = None
    social_skills: Optional[str] = None
    emotional_skills: Optional[str] = None
    eating_habits: Optional[str] = None
    sleep_pattern: Optional[str] = None
    sleep_hours: Optional[float] = None
    play_activities: Optional[List[str]] = None
    mood: Optional[str] = None
    special_moments: Optional[str] = None
    photos: Optional[List[str]] = None
    notes: Optional[str] = None


class DevelopmentLogResponse(BaseModel):
    """발달 일지 응답 스키마"""
    id: int
    child_id: int
    user_id: int
    log_date: date
    age_months: Optional[int]
    motor_skills: Optional[str]
    language_skills: Optional[str]
    sleep_hours: Optional[float]
    special_moments: Optional[str]
    photos: Optional[List[str]]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ========== Vaccination Schemas ==========

class VaccinationCreate(BaseModel):
    """예방접종 기록 생성 스키마"""
    child_id: int
    vaccine_name: str
    vaccine_type: Optional[str] = None
    dose_number: Optional[int] = None
    scheduled_date: Optional[date] = None
    actual_date: Optional[date] = None
    hospital_name: Optional[str] = None
    notes: Optional[str] = None


class VaccinationUpdate(BaseModel):
    """예방접종 기록 업데이트 스키마"""
    actual_date: Optional[date] = None
    is_completed: Optional[bool] = None
    side_effects: Optional[str] = None
    fever: Optional[bool] = None
    reaction_severity: Optional[str] = None
    next_dose_due_date: Optional[date] = None
    notes: Optional[str] = None


class VaccinationResponse(BaseModel):
    """예방접종 기록 응답 스키마"""
    id: int
    child_id: int
    user_id: int
    vaccine_name: str
    vaccine_type: Optional[str]
    dose_number: Optional[int]
    scheduled_date: Optional[date]
    actual_date: Optional[date]
    is_completed: bool
    side_effects: Optional[str]
    next_dose_due_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== HealthCheckup Schemas ==========

class HealthCheckupCreate(BaseModel):
    """건강검진 기록 생성 스키마"""
    child_id: Optional[int] = None  # NULL이면 본인 검진
    checkup_type: str
    checkup_name: Optional[str] = None
    scheduled_date: Optional[date] = None
    hospital_name: Optional[str] = None


class HealthCheckupUpdate(BaseModel):
    """건강검진 기록 업데이트 스키마"""
    actual_date: Optional[date] = None
    is_completed: Optional[bool] = None
    results: Optional[Dict[str, Any]] = None
    overall_status: Optional[str] = None
    findings: Optional[str] = None
    recommendations: Optional[str] = None
    next_checkup_date: Optional[date] = None
    notes: Optional[str] = None


class HealthCheckupResponse(BaseModel):
    """건강검진 기록 응답 스키마"""
    id: int
    user_id: int
    child_id: Optional[int]
    checkup_type: str
    checkup_name: Optional[str]
    scheduled_date: Optional[date]
    actual_date: Optional[date]
    is_completed: bool
    overall_status: Optional[str]
    findings: Optional[str]
    recommendations: Optional[str]
    next_checkup_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
