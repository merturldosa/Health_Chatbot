from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum


# Enums
class EmotionType(str, Enum):
    """감정 유형"""
    happy = "happy"
    sad = "sad"
    angry = "angry"
    anxious = "anxious"
    neutral = "neutral"
    excited = "excited"
    depressed = "depressed"


class ReminderType(str, Enum):
    """알림 유형"""
    medication = "medication"
    checkup = "checkup"
    exercise = "exercise"
    meal = "meal"
    water = "water"
    general = "general"


class EmergencyType(str, Enum):
    """응급 상황 유형"""
    fall_detection = "fall_detection"
    abnormal_vital = "abnormal_vital"
    distress_call = "distress_call"
    medication_missed = "medication_missed"
    other = "other"


# Voice Health Analysis Schemas
class VoiceHealthAnalysisBase(BaseModel):
    """음성 건강 분석 기본 스키마"""
    audio_file_path: Optional[str] = None
    average_pitch: Optional[float] = Field(None, description="평균 음높이 (Hz)")
    speech_rate: Optional[float] = Field(None, description="말하기 속도 (단어/분)")
    pause_frequency: Optional[int] = Field(None, description="휴지 빈도")
    voice_energy: Optional[float] = Field(None, description="음성 에너지")
    detected_emotion: Optional[EmotionType] = None
    emotion_confidence: Optional[float] = Field(None, ge=0, le=1)
    depression_indicator: Optional[float] = Field(None, ge=0, le=1)
    anxiety_indicator: Optional[float] = Field(None, ge=0, le=1)
    stress_level: Optional[float] = Field(None, ge=0, le=10)
    voice_tremor: Optional[bool] = None
    breathing_pattern: Optional[str] = None
    transcribed_text: Optional[str] = None
    ai_health_suggestion: Optional[str] = None


class VoiceHealthAnalysisCreate(VoiceHealthAnalysisBase):
    """음성 건강 분석 생성"""
    pass


class VoiceHealthAnalysisResponse(VoiceHealthAnalysisBase):
    """음성 건강 분석 응답"""
    id: int
    user_id: int
    analysis_timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# Voice Based Reminder Schemas
class VoiceBasedReminderBase(BaseModel):
    """음성 기반 알림 기본 스키마"""
    reminder_type: ReminderType
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_time: datetime
    tts_text: str = Field(..., description="TTS로 읽을 텍스트")
    voice_file_path: Optional[str] = None
    repeat_enabled: bool = False
    repeat_pattern: Optional[str] = Field(None, description="daily, weekly, etc.")
    is_active: bool = True


class VoiceBasedReminderCreate(VoiceBasedReminderBase):
    """음성 기반 알림 생성"""
    pass


class VoiceBasedReminderUpdate(BaseModel):
    """음성 기반 알림 수정"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    tts_text: Optional[str] = None
    repeat_enabled: Optional[bool] = None
    repeat_pattern: Optional[str] = None
    is_active: Optional[bool] = None


class VoiceBasedReminderResponse(VoiceBasedReminderBase):
    """음성 기반 알림 응답"""
    id: int
    user_id: int
    last_triggered: Optional[datetime] = None
    trigger_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Conversation Log Schemas
class ConversationLogBase(BaseModel):
    """대화 로그 기본 스키마"""
    conversation_type: str = Field(..., description="health_checkin, consultation, etc.")
    user_speech_text: Optional[str] = None
    user_speech_audio_path: Optional[str] = None
    ai_response_text: Optional[str] = None
    ai_response_audio_path: Optional[str] = None
    detected_intent: Optional[str] = None
    sentiment_score: Optional[float] = Field(None, ge=-1, le=1)
    conversation_metadata: Optional[Dict[str, Any]] = None


class ConversationLogCreate(ConversationLogBase):
    """대화 로그 생성"""
    pass


class ConversationLogResponse(ConversationLogBase):
    """대화 로그 응답"""
    id: int
    user_id: int
    conversation_timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# Voice Check-In Schemas
class VoiceCheckInBase(BaseModel):
    """음성 체크인 기본 스키마"""
    checkin_type: str = Field(..., description="morning, afternoon, evening, night")
    audio_file_path: Optional[str] = None
    mood_rating: Optional[int] = Field(None, ge=1, le=10)
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    detected_emotion: Optional[EmotionType] = None
    pain_level: Optional[int] = Field(None, ge=0, le=10)
    sleep_quality: Optional[int] = Field(None, ge=1, le=10)
    stress_level: Optional[int] = Field(None, ge=1, le=10)
    transcribed_response: Optional[str] = None
    ai_analysis: Optional[str] = None
    health_concern_detected: bool = False
    concern_details: Optional[str] = None


class VoiceCheckInCreate(VoiceCheckInBase):
    """음성 체크인 생성"""
    pass


class VoiceCheckInResponse(VoiceCheckInBase):
    """음성 체크인 응답"""
    id: int
    user_id: int
    checkin_timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# Emergency Voice Alert Schemas
class EmergencyVoiceAlertBase(BaseModel):
    """응급 음성 알림 기본 스키마"""
    emergency_type: EmergencyType
    voice_message: str = Field(..., description="TTS 응급 메시지")
    alert_audio_path: Optional[str] = None
    detected_from_voice: bool = False
    user_response: Optional[str] = None
    emergency_resolved: bool = False
    emergency_metadata: Optional[Dict[str, Any]] = None


class EmergencyVoiceAlertCreate(EmergencyVoiceAlertBase):
    """응급 음성 알림 생성"""
    pass


class EmergencyVoiceAlertUpdate(BaseModel):
    """응급 음성 알림 수정"""
    user_response: Optional[str] = None
    emergency_resolved: Optional[bool] = None
    resolved_at: Optional[datetime] = None


class EmergencyVoiceAlertResponse(EmergencyVoiceAlertBase):
    """응급 음성 알림 응답"""
    id: int
    user_id: int
    alert_triggered_at: datetime
    resolved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Health Notification Schemas
class HealthNotificationBase(BaseModel):
    """건강 알림 기본 스키마"""
    notification_type: str = Field(..., description="reminder, alert, info, etc.")
    title: str = Field(..., min_length=1, max_length=200)
    message: str
    tts_narration: Optional[str] = Field(None, description="터치 시 읽을 TTS 텍스트")
    narration_audio_path: Optional[str] = None
    priority: str = Field(default="normal", description="low, normal, high, urgent")
    is_read: bool = False
    is_narrated: bool = False


class HealthNotificationCreate(HealthNotificationBase):
    """건강 알림 생성"""
    pass


class HealthNotificationUpdate(BaseModel):
    """건강 알림 수정"""
    is_read: Optional[bool] = None
    is_narrated: Optional[bool] = None


class HealthNotificationResponse(HealthNotificationBase):
    """건강 알림 응답"""
    id: int
    user_id: int
    narrated_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Voice Analysis Request Schema
class VoiceAnalysisRequest(BaseModel):
    """음성 분석 요청"""
    audio_data: str = Field(..., description="Base64 encoded audio data")
    analysis_type: str = Field(default="full", description="full, emotion, health")


# Voice Narration Request Schema
class VoiceNarrationRequest(BaseModel):
    """음성 안내 요청"""
    text: str = Field(..., min_length=1, description="안내할 텍스트")
    voice_speed: float = Field(default=1.0, ge=0.5, le=2.0)
    voice_pitch: float = Field(default=1.0, ge=0.5, le=2.0)
