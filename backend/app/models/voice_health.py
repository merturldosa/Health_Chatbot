from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class VoiceHealthAnalysis(Base):
    """음성 기반 건강 분석 모델"""
    __tablename__ = "voice_health_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 음성 기록 정보
    recording_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    recording_duration = Column(Float)  # 녹음 시간 (초)
    audio_file_url = Column(String(500))  # 음성 파일 URL

    # 음성 특성 분석
    average_pitch = Column(Float)  # 평균 음높이 (Hz)
    pitch_variance = Column(Float)  # 음높이 변동성
    speech_rate = Column(Float)  # 말하기 속도 (단어/분)
    volume_level = Column(Float)  # 음량 수준 (dB)

    # 감정 분석
    detected_emotion = Column(String(50))  # happy, sad, angry, anxious, neutral, stressed
    emotion_confidence = Column(Float)  # 감정 탐지 신뢰도 (0-1)
    stress_level = Column(Integer)  # 스트레스 수준 (0-10)

    # 정신 건강 지표
    depression_indicator = Column(Float)  # 우울 지표 (0-1)
    anxiety_indicator = Column(Float)  # 불안 지표 (0-1)
    fatigue_indicator = Column(Float)  # 피로 지표 (0-1)

    # 육체 건강 지표 (음성 기반)
    voice_tremor = Column(Boolean)  # 음성 떨림 감지
    breathing_pattern = Column(String(50))  # 호흡 패턴: normal, irregular, labored
    cough_detected = Column(Boolean)  # 기침 감지
    throat_condition = Column(String(50))  # 목 상태: clear, hoarse, strained

    # AI 종합 분석
    overall_health_score = Column(Float)  # 전체 건강 점수 (0-100)
    mental_health_score = Column(Float)  # 정신 건강 점수 (0-100)
    physical_health_score = Column(Float)  # 육체 건강 점수 (0-100)

    ai_analysis = Column(Text)  # AI 상세 분석
    health_alerts = Column(JSON)  # 건강 경고 리스트
    recommendations = Column(JSON)  # 추천사항 리스트

    # 비교 분석
    comparison_with_baseline = Column(JSON)  # 기준선과의 비교
    trend_analysis = Column(Text)  # 추세 분석

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    user = relationship("User")


class VoiceBasedReminder(Base):
    """음성 기반 알림 모델"""
    __tablename__ = "voice_based_reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 알림 정보
    reminder_type = Column(String(50), nullable=False)  # medication, meal, exercise, checkup, mental_health
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    # 예약 시간
    scheduled_time = Column(DateTime, nullable=False)
    reminder_date = Column(DateTime, nullable=False)

    # 음성 안내 설정
    voice_enabled = Column(Boolean, default=True)  # 음성 안내 활성화
    voice_language = Column(String(10), default="ko-KR")  # 언어 설정
    voice_gender = Column(String(10), default="female")  # male, female
    voice_speed = Column(Float, default=1.0)  # 음성 속도 (0.5-2.0)

    # TTS 텍스트
    tts_text = Column(Text)  # Text-to-Speech 텍스트
    tts_audio_url = Column(String(500))  # 생성된 음성 파일 URL

    # 우선순위
    priority = Column(String(20), default="normal")  # low, normal, high, urgent

    # 반복 설정
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50))  # daily, weekly, monthly

    # 상태
    is_sent = Column(Boolean, default=False)
    is_acknowledged = Column(Boolean, default=False)  # 사용자가 확인했는지
    acknowledged_at = Column(DateTime)

    # 사용자 반응
    was_voice_played = Column(Boolean, default=False)  # 음성이 재생되었는지
    user_interaction = Column(String(50))  # dismissed, snoozed, completed

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    user = relationship("User")


class ConversationLog(Base):
    """대화 로그 모델 (음성 대화 포함)"""
    __tablename__ = "conversation_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 대화 정보
    conversation_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    conversation_type = Column(String(50))  # text, voice, mixed

    # 사용자 입력
    user_input_text = Column(Text)  # 텍스트 입력 또는 음성→텍스트 변환
    user_voice_url = Column(String(500))  # 사용자 음성 파일

    # AI 응답
    ai_response_text = Column(Text)
    ai_response_voice_url = Column(String(500))  # TTS 생성 음성

    # 감정/의도 분석
    user_emotion = Column(String(50))  # 사용자 감정
    user_intent = Column(String(100))  # 사용자 의도
    conversation_topic = Column(String(100))  # 대화 주제

    # 건강 관련 키워드
    health_keywords = Column(JSON)  # 감지된 건강 관련 키워드
    concerns_detected = Column(JSON)  # 감지된 건강 우려사항

    # 품질 평가
    user_satisfaction = Column(Integer)  # 사용자 만족도 (1-5)
    response_helpfulness = Column(Integer)  # 응답 유용성 (1-5)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    user = relationship("User")


class VoiceCheckIn(Base):
    """일일 음성 체크인 모델"""
    __tablename__ = "voice_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 체크인 정보
    checkin_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    checkin_type = Column(String(50))  # morning, afternoon, evening, night

    # 간단한 질문-응답
    question_asked = Column(Text)  # "오늘 기분이 어떠세요?"
    voice_response_url = Column(String(500))  # 음성 응답
    text_response = Column(Text)  # 텍스트 변환

    # 감정 상태
    emotion_detected = Column(String(50))
    mood_score = Column(Integer)  # 1-10
    energy_level = Column(Integer)  # 1-10

    # 건강 상태 체크
    pain_reported = Column(Boolean, default=False)
    pain_location = Column(String(100))
    pain_level = Column(Integer)  # 0-10

    symptoms_reported = Column(JSON)  # 보고된 증상들

    # AI 평가
    health_concern_level = Column(String(20))  # low, medium, high
    ai_suggestion = Column(Text)
    follow_up_needed = Column(Boolean, default=False)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    user = relationship("User")


class EmergencyVoiceAlert(Base):
    """긴급 음성 경고 모델"""
    __tablename__ = "emergency_voice_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 경고 정보
    alert_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    alert_type = Column(String(50))  # health_crisis, medication_missed, abnormal_vitals, fall_detected
    severity = Column(String(20))  # warning, critical, emergency

    # 탐지된 내용
    trigger_reason = Column(Text)  # 경고 트리거 이유
    detected_indicators = Column(JSON)  # 탐지된 지표들

    # 음성 기반 감지
    voice_analysis_id = Column(Integer, ForeignKey("voice_health_analyses.id"))
    abnormal_voice_patterns = Column(JSON)

    # 알림 전송
    alert_sent = Column(Boolean, default=False)
    alert_sent_at = Column(DateTime)
    voice_alert_played = Column(Boolean, default=False)

    # 긴급 연락
    emergency_contact_notified = Column(Boolean, default=False)
    emergency_services_contacted = Column(Boolean, default=False)

    # 사용자 반응
    user_responded = Column(Boolean, default=False)
    user_response_time = Column(Float)  # 초
    user_status = Column(String(50))  # ok, need_help, no_response

    # 해결
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime)
    resolution_notes = Column(Text)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    user = relationship("User")
    voice_analysis = relationship("VoiceHealthAnalysis")


class HealthNotification(Base):
    """건강 알림 모델 (푸시 알림)"""
    __tablename__ = "health_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 알림 정보
    notification_type = Column(String(50), nullable=False)  # reminder, alert, tip, achievement
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)

    # 음성 안내
    has_voice_narration = Column(Boolean, default=False)
    voice_narration_text = Column(Text)  # TTS용 텍스트
    voice_narration_url = Column(String(500))  # 생성된 음성 파일

    # 우선순위 및 카테고리
    priority = Column(String(20), default="normal")
    category = Column(String(50))  # medication, appointment, exercise, nutrition, mental_health

    # 액션
    action_url = Column(String(500))  # 클릭 시 이동할 URL
    action_type = Column(String(50))  # open_app, open_page, call_doctor, emergency

    # 예약 및 전송
    scheduled_for = Column(DateTime)
    sent_at = Column(DateTime)
    is_sent = Column(Boolean, default=False)

    # 사용자 상호작용
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime)
    was_clicked = Column(Boolean, default=False)
    clicked_at = Column(DateTime)
    voice_was_played = Column(Boolean, default=False)

    # 만료
    expires_at = Column(DateTime)
    is_expired = Column(Boolean, default=False)

    # 타임스탬프
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # 관계
    user = relationship("User")
