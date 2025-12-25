from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class DiseaseSeverity(str, enum.Enum):
    """질병 심각도"""
    MILD = "mild"  # 경증
    MODERATE = "moderate"  # 중등도
    SEVERE = "severe"  # 중증
    CRITICAL = "critical"  # 위중


class TreatmentPlanDuration(str, enum.Enum):
    """치료 계획 기간"""
    THREE_MONTHS = "3_months"
    SIX_MONTHS = "6_months"
    TWELVE_MONTHS = "12_months"


class DiseaseRecord(Base):
    """질병 기록 모델"""
    __tablename__ = "disease_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 질병 기본 정보
    disease_name = Column(String(255), nullable=False)  # 질병명
    disease_code = Column(String(50))  # ICD 코드 등
    severity = Column(Enum(DiseaseSeverity), nullable=False)  # 심각도
    diagnosis_date = Column(DateTime, nullable=False)  # 진단일

    # 상세 정보
    symptoms = Column(JSON)  # 증상 목록 (리스트)
    current_status = Column(String(50))  # 현재 상태: 치료중, 호전중, 완치 등
    doctor_name = Column(String(100))  # 담당 의사
    hospital_name = Column(String(255))  # 병원명

    # 치료 정보
    treatment_method = Column(Text)  # 치료 방법
    medications = Column(JSON)  # 복용 약물 리스트
    precautions = Column(Text)  # 주의사항

    # 진행 상황
    improvement_score = Column(Float, default=0.0)  # 호전도 점수 (0-100)
    notes = Column(Text)  # 메모

    # AI 분석
    ai_analysis = Column(Text)  # AI 분석 결과
    ai_recommendations = Column(Text)  # AI 추천사항

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("User", back_populates="disease_records")
    treatment_plans = relationship("TreatmentPlan", back_populates="disease_record", cascade="all, delete-orphan")
    checklists = relationship("DiseaseChecklist", back_populates="disease_record", cascade="all, delete-orphan")
    progress_logs = relationship("DiseaseProgressLog", back_populates="disease_record", cascade="all, delete-orphan")


class TreatmentPlan(Base):
    """치료 계획 모델"""
    __tablename__ = "treatment_plans"

    id = Column(Integer, primary_key=True, index=True)
    disease_record_id = Column(Integer, ForeignKey("disease_records.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 계획 정보
    plan_name = Column(String(255), nullable=False)  # 계획명
    duration = Column(Enum(TreatmentPlanDuration), nullable=False)  # 기간
    start_date = Column(DateTime, nullable=False)  # 시작일
    end_date = Column(DateTime, nullable=False)  # 종료일

    # 목표
    goals = Column(JSON, nullable=False)  # 목표 리스트
    milestones = Column(JSON)  # 주요 이정표

    # 계획 내용
    daily_tasks = Column(JSON)  # 일일 과제
    weekly_tasks = Column(JSON)  # 주간 과제
    monthly_tasks = Column(JSON)  # 월간 과제

    # 진행 상황
    completion_percentage = Column(Float, default=0.0)  # 완료율
    is_active = Column(Boolean, default=True)  # 활성 상태

    # AI 생성
    ai_generated = Column(Boolean, default=False)  # AI 생성 여부
    ai_recommendations = Column(Text)  # AI 추천사항

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    disease_record = relationship("DiseaseRecord", back_populates="treatment_plans")
    user = relationship("User")


class DiseaseChecklist(Base):
    """질병 관리 체크리스트 모델"""
    __tablename__ = "disease_checklists"

    id = Column(Integer, primary_key=True, index=True)
    disease_record_id = Column(Integer, ForeignKey("disease_records.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 체크리스트 항목
    title = Column(String(255), nullable=False)  # 제목
    description = Column(Text)  # 설명
    checklist_date = Column(DateTime, nullable=False)  # 날짜

    # 체크 항목들
    items = Column(JSON, nullable=False)  # 체크리스트 항목들 (리스트)

    # 완료 상태
    completed_count = Column(Integer, default=0)  # 완료된 항목 수
    total_count = Column(Integer, nullable=False)  # 전체 항목 수
    is_completed = Column(Boolean, default=False)  # 전체 완료 여부

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    disease_record = relationship("DiseaseRecord", back_populates="checklists")
    user = relationship("User")


class DiseaseProgressLog(Base):
    """질병 진행 상황 로그 모델"""
    __tablename__ = "disease_progress_logs"

    id = Column(Integer, primary_key=True, index=True)
    disease_record_id = Column(Integer, ForeignKey("disease_records.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 로그 정보
    log_date = Column(DateTime, nullable=False, default=datetime.utcnow)  # 기록 날짜
    improvement_score = Column(Float, nullable=False)  # 호전도 점수 (0-100)

    # 증상 변화
    symptoms_severity = Column(JSON)  # 증상별 심각도 변화
    pain_level = Column(Integer)  # 통증 수준 (0-10)

    # 활동 수준
    activity_level = Column(String(50))  # 활동 수준
    energy_level = Column(Integer)  # 에너지 수준 (0-10)

    # 메모
    notes = Column(Text)  # 특이사항 메모

    # AI 분석
    ai_analysis = Column(Text)  # AI 분석

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    disease_record = relationship("DiseaseRecord", back_populates="progress_logs")
    user = relationship("User")
