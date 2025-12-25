from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class PregnancyRecord(Base):
    """임신 기록 모델 (임신 전 준비 ~ 출산)"""
    __tablename__ = "pregnancy_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 기본 정보
    pregnancy_status = Column(String(50), nullable=False)  # preparing, pregnant, postpartum, completed
    conception_date = Column(Date)  # 수태일 (임신 시작일)
    due_date = Column(Date)  # 출산 예정일
    actual_birth_date = Column(Date)  # 실제 출산일

    # 임신 전 준비
    pre_pregnancy_checkup_date = Column(Date)  # 임신 전 건강검진일
    pre_pregnancy_notes = Column(Text)  # 임신 전 준비 메모

    # 임신 중 정보
    current_week = Column(Integer)  # 현재 임신 주차
    current_trimester = Column(Integer)  # 현재 임신 삼분기 (1, 2, 3)

    # 건강 정보
    weight_before_pregnancy = Column(Float)  # 임신 전 체중 (kg)
    current_weight = Column(Float)  # 현재 체중 (kg)
    blood_pressure = Column(String(20))  # 혈압
    blood_sugar = Column(Float)  # 혈당

    # 병원 정보
    hospital_name = Column(String(255))  # 병원명
    doctor_name = Column(String(100))  # 담당 의사
    next_checkup_date = Column(Date)  # 다음 검진일

    # 태아 정보
    baby_gender = Column(String(20))  # 태아 성별
    baby_name = Column(String(100))  # 태아 이름 (애칭)
    number_of_babies = Column(Integer, default=1)  # 태아 수 (쌍둥이 등)

    # 증상 및 컨디션
    symptoms = Column(JSON)  # 증상 리스트
    mood_status = Column(String(50))  # 기분 상태
    energy_level = Column(Integer)  # 에너지 수준 (0-10)

    # AI 분석
    ai_analysis = Column(Text)  # AI 분석
    ai_recommendations = Column(Text)  # AI 추천사항
    risk_level = Column(String(20))  # 위험도: low, medium, high

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("User", back_populates="pregnancy_records")
    prenatal_cares = relationship("PrenatalCare", back_populates="pregnancy_record", cascade="all, delete-orphan")
    pregnancy_logs = relationship("PregnancyLog", back_populates="pregnancy_record", cascade="all, delete-orphan")


class PrenatalCare(Base):
    """태교 기록 모델"""
    __tablename__ = "prenatal_cares"

    id = Column(Integer, primary_key=True, index=True)
    pregnancy_record_id = Column(Integer, ForeignKey("pregnancy_records.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 기본 정보
    care_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    care_type = Column(String(50), nullable=False)  # music, talking, reading, movement, other

    # 태교 내용
    title = Column(String(255))  # 제목
    description = Column(Text)  # 설명
    duration_minutes = Column(Integer)  # 소요 시간 (분)

    # 음악 태교
    music_title = Column(String(255))  # 음악 제목
    music_genre = Column(String(100))  # 음악 장르
    music_url = Column(String(500))  # 음악 URL

    # 태담
    talking_content = Column(Text)  # 태담 내용
    voice_recording_url = Column(String(500))  # 음성 녹음 URL

    # 태동 기록
    fetal_movement_count = Column(Integer)  # 태동 횟수
    fetal_movement_strength = Column(String(20))  # 태동 강도: weak, medium, strong
    fetal_movement_pattern = Column(String(100))  # 태동 패턴

    # 기분 및 반응
    mother_mood = Column(String(50))  # 엄마 기분
    baby_response = Column(Text)  # 태아 반응 (주관적)

    # 사진/이미지
    image_url = Column(String(500))  # 사진 URL

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    pregnancy_record = relationship("PregnancyRecord", back_populates="prenatal_cares")
    user = relationship("User")


class PregnancyLog(Base):
    """임신 일지 모델"""
    __tablename__ = "pregnancy_logs"

    id = Column(Integer, primary_key=True, index=True)
    pregnancy_record_id = Column(Integer, ForeignKey("pregnancy_records.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 기본 정보
    log_date = Column(Date, nullable=False)
    pregnancy_week = Column(Integer)  # 임신 주차

    # 건강 정보
    weight = Column(Float)  # 체중
    blood_pressure = Column(String(20))  # 혈압
    temperature = Column(Float)  # 체온

    # 증상
    symptoms = Column(JSON)  # 증상 리스트
    nausea_level = Column(Integer)  # 메스꺼움 정도 (0-10)
    fatigue_level = Column(Integer)  # 피로도 (0-10)
    pain_level = Column(Integer)  # 통증 (0-10)

    # 활동
    exercise_type = Column(String(100))  # 운동 종류
    exercise_duration = Column(Integer)  # 운동 시간 (분)
    sleep_hours = Column(Float)  # 수면 시간

    # 영양
    meals = Column(JSON)  # 식사 기록
    water_intake = Column(Float)  # 수분 섭취량 (L)
    supplements = Column(JSON)  # 영양제 복용

    # 기분
    mood = Column(String(50))  # 기분
    stress_level = Column(Integer)  # 스트레스 (0-10)
    anxiety_level = Column(Integer)  # 불안감 (0-10)

    # 태동
    fetal_movement_count = Column(Integer)  # 태동 횟수
    fetal_movement_notes = Column(Text)  # 태동 메모

    # 메모
    notes = Column(Text)

    # AI 분석
    ai_analysis = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    pregnancy_record = relationship("PregnancyRecord", back_populates="pregnancy_logs")
    user = relationship("User")


class PostpartumCare(Base):
    """산후조리 기록 모델"""
    __tablename__ = "postpartum_cares"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 기본 정보
    birth_date = Column(Date, nullable=False)  # 출산일
    days_after_birth = Column(Integer)  # 산후 일수

    # 산후조리 정보
    care_type = Column(String(50))  # home, postpartum_center
    care_center_name = Column(String(255))  # 산후조리원 이름
    care_start_date = Column(Date)  # 조리 시작일
    care_end_date = Column(Date)  # 조리 종료일

    # 건강 상태
    physical_recovery_score = Column(Integer)  # 신체 회복도 (0-10)
    pain_level = Column(Integer)  # 통증 (0-10)
    bleeding_status = Column(String(50))  # 출혈 상태
    wound_healing_status = Column(String(50))  # 상처 회복 상태

    # 모유 수유
    breastfeeding_status = Column(String(50))  # exclusive, partial, none
    milk_supply = Column(String(50))  # insufficient, adequate, abundant
    breastfeeding_difficulty = Column(Text)  # 수유 어려움

    # 정신 건강
    mood_score = Column(Integer)  # 기분 점수 (0-10)
    depression_screening_score = Column(Integer)  # 산후우울증 검사 점수
    anxiety_level = Column(Integer)  # 불안 수준 (0-10)
    sleep_quality = Column(Integer)  # 수면 질 (0-10)

    # 증상
    symptoms = Column(JSON)  # 증상 리스트
    concerns = Column(Text)  # 우려사항

    # 활동
    exercise_allowed = Column(Boolean, default=False)  # 운동 가능 여부
    daily_activity_level = Column(String(50))  # 일상 활동 수준

    # 영양
    diet_plan = Column(Text)  # 식단 계획
    supplements = Column(JSON)  # 영양제

    # AI 분석 및 추천
    ai_analysis = Column(Text)
    ai_recommendations = Column(Text)
    postpartum_depression_risk = Column(String(20))  # low, medium, high

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("User")
    postpartum_logs = relationship("PostpartumLog", back_populates="postpartum_care", cascade="all, delete-orphan")


class PostpartumLog(Base):
    """산후 일지 모델"""
    __tablename__ = "postpartum_logs"

    id = Column(Integer, primary_key=True, index=True)
    postpartum_care_id = Column(Integer, ForeignKey("postpartum_cares.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 기본 정보
    log_date = Column(Date, nullable=False)
    days_after_birth = Column(Integer)  # 산후 일수

    # 건강
    physical_condition = Column(Integer)  # 신체 컨디션 (0-10)
    pain_level = Column(Integer)  # 통증 (0-10)
    bleeding_amount = Column(String(20))  # 출혈량: light, moderate, heavy

    # 모유 수유
    breastfeeding_frequency = Column(Integer)  # 수유 횟수
    breastfeeding_duration_total = Column(Integer)  # 총 수유 시간 (분)
    breast_condition = Column(Text)  # 유방 상태

    # 정신 건강
    mood_score = Column(Integer)  # 기분 (0-10)
    crying_episodes = Column(Integer)  # 울음 횟수
    anxiety_level = Column(Integer)  # 불안 (0-10)
    sleep_hours = Column(Float)  # 수면 시간

    # 활동 및 식사
    activity_notes = Column(Text)  # 활동 기록
    meals_quality = Column(Integer)  # 식사 질 (0-10)
    water_intake = Column(Float)  # 수분 섭취 (L)

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    postpartum_care = relationship("PostpartumCare", back_populates="postpartum_logs")
    user = relationship("User")


class ChildDevelopment(Base):
    """육아 일지 모델 (0~8세)"""
    __tablename__ = "child_developments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 아이 기본 정보
    child_name = Column(String(100), nullable=False)
    child_gender = Column(String(20))
    birth_date = Column(Date, nullable=False)
    birth_weight = Column(Float)  # 출생 체중 (kg)
    birth_height = Column(Float)  # 출생 신장 (cm)

    # 현재 정보
    current_age_months = Column(Integer)  # 현재 나이 (개월)
    current_weight = Column(Float)  # 현재 체중 (kg)
    current_height = Column(Float)  # 현재 신장 (cm)
    current_head_circumference = Column(Float)  # 머리둘레 (cm)

    # 발달 단계
    developmental_stage = Column(String(50))  # infant, toddler, preschool, school_age

    # 발달 이정표
    milestones_achieved = Column(JSON)  # 달성한 발달 이정표
    milestones_upcoming = Column(JSON)  # 앞으로의 발달 이정표

    # 건강
    health_conditions = Column(JSON)  # 건강 상태
    allergies = Column(JSON)  # 알레르기
    medications = Column(JSON)  # 복용 약물

    # 사진
    profile_image_url = Column(String(500))  # 프로필 사진

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("User")
    growth_records = relationship("GrowthRecord", back_populates="child", cascade="all, delete-orphan")
    development_logs = relationship("DevelopmentLog", back_populates="child", cascade="all, delete-orphan")
    vaccinations = relationship("Vaccination", back_populates="child", cascade="all, delete-orphan")


class GrowthRecord(Base):
    """성장 기록 모델"""
    __tablename__ = "growth_records"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_developments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 측정 정보
    measurement_date = Column(Date, nullable=False)
    age_months = Column(Integer)  # 측정 시 나이 (개월)

    # 성장 수치
    weight = Column(Float, nullable=False)  # 체중 (kg)
    height = Column(Float, nullable=False)  # 신장 (cm)
    head_circumference = Column(Float)  # 머리둘레 (cm)
    bmi = Column(Float)  # BMI

    # 백분위수 (성장 곡선)
    weight_percentile = Column(Float)  # 체중 백분위
    height_percentile = Column(Float)  # 신장 백분위

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    child = relationship("ChildDevelopment", back_populates="growth_records")
    user = relationship("User")


class DevelopmentLog(Base):
    """발달 일지 모델"""
    __tablename__ = "development_logs"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_developments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 기본 정보
    log_date = Column(Date, nullable=False)
    age_months = Column(Integer)  # 기록 시 나이 (개월)

    # 발달 영역별 기록
    motor_skills = Column(Text)  # 운동 발달
    language_skills = Column(Text)  # 언어 발달
    cognitive_skills = Column(Text)  # 인지 발달
    social_skills = Column(Text)  # 사회성 발달
    emotional_skills = Column(Text)  # 정서 발달

    # 일상 활동
    eating_habits = Column(Text)  # 식습관
    sleep_pattern = Column(Text)  # 수면 패턴
    sleep_hours = Column(Float)  # 수면 시간

    # 놀이 및 활동
    play_activities = Column(JSON)  # 놀이 활동
    favorite_toys = Column(JSON)  # 좋아하는 장난감
    outdoor_time = Column(Integer)  # 야외 활동 시간 (분)

    # 건강
    health_notes = Column(Text)  # 건강 메모
    mood = Column(String(50))  # 기분
    appetite = Column(String(50))  # 식욕

    # 특별한 순간
    special_moments = Column(Text)  # 특별한 순간/이정표
    photos = Column(JSON)  # 사진 URLs

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    child = relationship("ChildDevelopment", back_populates="development_logs")
    user = relationship("User")


class Vaccination(Base):
    """예방접종 기록 모델"""
    __tablename__ = "vaccinations"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_developments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 접종 정보
    vaccine_name = Column(String(255), nullable=False)  # 백신명
    vaccine_type = Column(String(100))  # 백신 종류
    dose_number = Column(Integer)  # 차수 (1차, 2차 등)

    # 일정
    scheduled_date = Column(Date)  # 예정일
    actual_date = Column(Date)  # 실제 접종일
    is_completed = Column(Boolean, default=False)  # 접종 완료 여부

    # 접종 장소
    hospital_name = Column(String(255))  # 병원명
    doctor_name = Column(String(100))  # 의사명

    # 반응
    side_effects = Column(Text)  # 부작용
    fever = Column(Boolean, default=False)  # 발열 여부
    reaction_severity = Column(String(20))  # 반응 정도: mild, moderate, severe

    # 다음 접종
    next_dose_due_date = Column(Date)  # 다음 차수 예정일

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    child = relationship("ChildDevelopment", back_populates="vaccinations")
    user = relationship("User")


class HealthCheckup(Base):
    """건강검진 기록 모델"""
    __tablename__ = "health_checkups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    child_id = Column(Integer, ForeignKey("child_developments.id"))  # NULL이면 본인 검진

    # 검진 정보
    checkup_type = Column(String(100), nullable=False)  # 검진 종류
    checkup_name = Column(String(255))  # 검진명

    # 일정
    scheduled_date = Column(Date)  # 예정일
    actual_date = Column(Date)  # 실제 검진일
    is_completed = Column(Boolean, default=False)  # 완료 여부

    # 검진 장소
    hospital_name = Column(String(255))  # 병원명
    doctor_name = Column(String(100))  # 의사명

    # 검진 결과
    results = Column(JSON)  # 검진 결과
    overall_status = Column(String(50))  # 전체 상태: normal, abnormal, follow_up_needed
    findings = Column(Text)  # 소견
    recommendations = Column(Text)  # 권고사항

    # 다음 검진
    next_checkup_date = Column(Date)  # 다음 검진 예정일

    # 파일
    result_files = Column(JSON)  # 결과지 파일 URLs

    # 메모
    notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("User")
