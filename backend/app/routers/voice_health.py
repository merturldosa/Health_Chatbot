from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
import base64

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.voice_health import (
    VoiceHealthAnalysis,
    VoiceBasedReminder,
    ConversationLog,
    VoiceCheckIn,
    EmergencyVoiceAlert,
    HealthNotification
)
from app.schemas.voice_health import (
    VoiceHealthAnalysisCreate,
    VoiceHealthAnalysisResponse,
    VoiceBasedReminderCreate,
    VoiceBasedReminderUpdate,
    VoiceBasedReminderResponse,
    ConversationLogCreate,
    ConversationLogResponse,
    VoiceCheckInCreate,
    VoiceCheckInResponse,
    EmergencyVoiceAlertCreate,
    EmergencyVoiceAlertUpdate,
    EmergencyVoiceAlertResponse,
    HealthNotificationCreate,
    HealthNotificationUpdate,
    HealthNotificationResponse,
    VoiceAnalysisRequest,
    VoiceNarrationRequest
)

router = APIRouter(prefix="/voice", tags=["voice_health"])


# ==================== Voice Health Analysis ====================

@router.post("/analyze", response_model=VoiceHealthAnalysisResponse)
async def analyze_voice(
    request: VoiceAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    음성 분석 API
    - 마이크 녹음 데이터를 받아 정신/육체 건강 상태 분석
    - 감정, 스트레스, 우울/불안 지표 분석
    """
    # TODO: 실제 음성 분석 AI 모델 연동
    # 현재는 시뮬레이션 데이터 반환

    # Base64 audio data를 디코딩하여 파일로 저장하는 로직 추가 필요
    # audio_bytes = base64.b64decode(request.audio_data)
    # 파일 저장 및 경로 생성

    analysis = VoiceHealthAnalysis(
        user_id=current_user.id,
        audio_file_path="/uploads/voice/sample.webm",
        average_pitch=180.5,
        speech_rate=120.0,
        pause_frequency=5,
        voice_energy=0.75,
        detected_emotion="happy",
        emotion_confidence=0.85,
        depression_indicator=0.15,
        anxiety_indicator=0.20,
        stress_level=3.5,
        voice_tremor=False,
        breathing_pattern="normal",
        transcribed_text="오늘 기분이 좋습니다. 잘 잤어요.",
        ai_health_suggestion="전반적으로 좋은 상태입니다. 수분 섭취를 잊지 마세요.",
        analysis_timestamp=datetime.now()
    )

    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)

    return analysis


@router.get("/analyses", response_model=List[VoiceHealthAnalysisResponse])
async def get_voice_analyses(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 음성 분석 기록 조회"""
    result = await db.execute(
        select(VoiceHealthAnalysis)
        .where(VoiceHealthAnalysis.user_id == current_user.id)
        .order_by(VoiceHealthAnalysis.analysis_timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


# ==================== Voice Based Reminders ====================

@router.post("/reminders", response_model=VoiceBasedReminderResponse)
async def create_voice_reminder(
    reminder: VoiceBasedReminderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """음성 안내 알림 생성 (터치 시 TTS로 안내)"""
    db_reminder = VoiceBasedReminder(
        **reminder.dict(),
        user_id=current_user.id
    )

    db.add(db_reminder)
    await db.commit()
    await db.refresh(db_reminder)

    return db_reminder


@router.get("/reminders", response_model=List[VoiceBasedReminderResponse])
async def get_voice_reminders(
    skip: int = 0,
    limit: int = 50,
    is_active: bool = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 음성 알림 목록 조회"""
    query = select(VoiceBasedReminder).where(
        VoiceBasedReminder.user_id == current_user.id
    )

    if is_active is not None:
        query = query.where(VoiceBasedReminder.is_active == is_active)

    result = await db.execute(
        query.order_by(VoiceBasedReminder.scheduled_time)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.patch("/reminders/{reminder_id}", response_model=VoiceBasedReminderResponse)
async def update_voice_reminder(
    reminder_id: int,
    reminder_update: VoiceBasedReminderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """음성 알림 수정"""
    result = await db.execute(
        select(VoiceBasedReminder).where(
            VoiceBasedReminder.id == reminder_id,
            VoiceBasedReminder.user_id == current_user.id
        )
    )
    db_reminder = result.scalar_one_or_none()

    if not db_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    for field, value in reminder_update.dict(exclude_unset=True).items():
        setattr(db_reminder, field, value)

    await db.commit()
    await db.refresh(db_reminder)

    return db_reminder


@router.delete("/reminders/{reminder_id}")
async def delete_voice_reminder(
    reminder_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """음성 알림 삭제"""
    result = await db.execute(
        select(VoiceBasedReminder).where(
            VoiceBasedReminder.id == reminder_id,
            VoiceBasedReminder.user_id == current_user.id
        )
    )
    db_reminder = result.scalar_one_or_none()

    if not db_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    await db.delete(db_reminder)
    await db.commit()

    return {"message": "Reminder deleted successfully"}


# ==================== Voice Check-In ====================

@router.post("/checkin", response_model=VoiceCheckInResponse)
async def create_voice_checkin(
    checkin: VoiceCheckInCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """일일 음성 체크인 생성"""
    db_checkin = VoiceCheckIn(
        **checkin.dict(),
        user_id=current_user.id,
        checkin_timestamp=datetime.now()
    )

    db.add(db_checkin)
    await db.commit()
    await db.refresh(db_checkin)

    return db_checkin


@router.get("/checkins", response_model=List[VoiceCheckInResponse])
async def get_voice_checkins(
    skip: int = 0,
    limit: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 음성 체크인 기록 조회"""
    result = await db.execute(
        select(VoiceCheckIn)
        .where(VoiceCheckIn.user_id == current_user.id)
        .order_by(VoiceCheckIn.checkin_timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/checkins/stats")
async def get_checkin_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """체크인 통계 (평균 기분, 에너지, 스트레스 등)"""
    # TODO: 통계 계산 로직 구현
    return {
        "average_mood": 7.5,
        "average_energy": 6.8,
        "average_stress": 4.2,
        "total_checkins": 45,
        "checkins_this_week": 6
    }


# ==================== Conversation Logs ====================

@router.post("/conversations", response_model=ConversationLogResponse)
async def create_conversation_log(
    conversation: ConversationLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """대화 로그 생성 (STT + TTS)"""
    db_conversation = ConversationLog(
        **conversation.dict(),
        user_id=current_user.id,
        conversation_timestamp=datetime.now()
    )

    db.add(db_conversation)
    await db.commit()
    await db.refresh(db_conversation)

    return db_conversation


@router.get("/conversations", response_model=List[ConversationLogResponse])
async def get_conversation_logs(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 대화 로그 조회"""
    result = await db.execute(
        select(ConversationLog)
        .where(ConversationLog.user_id == current_user.id)
        .order_by(ConversationLog.conversation_timestamp.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


# ==================== Emergency Alerts ====================

@router.post("/emergency", response_model=EmergencyVoiceAlertResponse)
async def create_emergency_alert(
    alert: EmergencyVoiceAlertCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """응급 상황 음성 알림 생성"""
    db_alert = EmergencyVoiceAlert(
        **alert.dict(),
        user_id=current_user.id,
        alert_triggered_at=datetime.now()
    )

    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)

    # TODO: 실제 응급 알림 전송 로직 (보호자, 의료진 등)

    return db_alert


@router.get("/emergency", response_model=List[EmergencyVoiceAlertResponse])
async def get_emergency_alerts(
    skip: int = 0,
    limit: int = 20,
    resolved: bool = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """응급 알림 목록 조회"""
    query = select(EmergencyVoiceAlert).where(
        EmergencyVoiceAlert.user_id == current_user.id
    )

    if resolved is not None:
        query = query.where(EmergencyVoiceAlert.emergency_resolved == resolved)

    result = await db.execute(
        query.order_by(EmergencyVoiceAlert.alert_triggered_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.patch("/emergency/{alert_id}", response_model=EmergencyVoiceAlertResponse)
async def update_emergency_alert(
    alert_id: int,
    alert_update: EmergencyVoiceAlertUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """응급 알림 상태 업데이트"""
    result = await db.execute(
        select(EmergencyVoiceAlert).where(
            EmergencyVoiceAlert.id == alert_id,
            EmergencyVoiceAlert.user_id == current_user.id
        )
    )
    db_alert = result.scalar_one_or_none()

    if not db_alert:
        raise HTTPException(status_code=404, detail="Emergency alert not found")

    for field, value in alert_update.dict(exclude_unset=True).items():
        setattr(db_alert, field, value)

    await db.commit()
    await db.refresh(db_alert)

    return db_alert


# ==================== Health Notifications ====================

@router.post("/notifications", response_model=HealthNotificationResponse)
async def create_health_notification(
    notification: HealthNotificationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """건강 알림 생성 (터치 시 TTS 안내)"""
    db_notification = HealthNotification(
        **notification.dict(),
        user_id=current_user.id
    )

    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)

    return db_notification


@router.get("/notifications", response_model=List[HealthNotificationResponse])
async def get_health_notifications(
    skip: int = 0,
    limit: int = 50,
    is_read: bool = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """건강 알림 목록 조회"""
    query = select(HealthNotification).where(
        HealthNotification.user_id == current_user.id
    )

    if is_read is not None:
        query = query.where(HealthNotification.is_read == is_read)

    result = await db.execute(
        query.order_by(HealthNotification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.patch("/notifications/{notification_id}", response_model=HealthNotificationResponse)
async def update_health_notification(
    notification_id: int,
    notification_update: HealthNotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """건강 알림 상태 업데이트 (읽음, 음성 안내 완료 등)"""
    result = await db.execute(
        select(HealthNotification).where(
            HealthNotification.id == notification_id,
            HealthNotification.user_id == current_user.id
        )
    )
    db_notification = result.scalar_one_or_none()

    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    for field, value in notification_update.dict(exclude_unset=True).items():
        setattr(db_notification, field, value)

    # 음성 안내 완료 시 타임스탬프 기록
    if notification_update.is_narrated and notification_update.is_narrated != db_notification.is_narrated:
        db_notification.narrated_at = datetime.now()

    await db.commit()
    await db.refresh(db_notification)

    return db_notification


# ==================== TTS Narration ====================

@router.post("/narrate")
async def narrate_text(
    request: VoiceNarrationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    텍스트를 음성으로 변환 (TTS)
    - 알림 터치 시 음성 안내
    """
    # TODO: 실제 TTS 엔진 연동 (Google TTS, Azure TTS 등)
    # 현재는 프론트엔드에서 Web Speech API 사용

    return {
        "text": request.text,
        "audio_url": "/tts/audio/sample.mp3",  # 생성된 오디오 파일 URL
        "success": True
    }


@router.get("/health-summary/narrate")
async def narrate_health_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    건강 종합 현황을 음성으로 안내
    - 정신 건강, 육체 건강, 질병 위험도, 호전도 등
    """
    # TODO: 실제 건강 데이터 조회

    summary_text = f"""
    안녕하세요, {current_user.full_name}님.
    현재 건강 상태를 안내해드립니다.
    정신 건강 점수는 75점으로 양호합니다.
    육체 건강 점수는 82점입니다.
    질병 위험도는 25퍼센트로 낮은 수준입니다.
    질병 호전도는 65퍼센트로 개선되고 있습니다.
    건강한 하루 되세요.
    """

    return {
        "text": summary_text,
        "audio_url": "/tts/audio/health_summary.mp3",
        "success": True
    }


# ==================== Continuous Voice Monitoring ====================

from pydantic import BaseModel

class ContinuousAnalysisData(BaseModel):
    """상시 모니터링 분석 데이터"""
    stress_level: float
    anxiety_indicator: float
    depression_indicator: float
    energy_level: float
    overall_status: str
    timestamp: str


@router.post("/continuous-analysis")
async def save_continuous_analysis(
    data: ContinuousAnalysisData,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    상시 음성 모니터링 분석 결과 저장
    - 30초마다 자동으로 분석된 정신 상태 데이터 저장
    - 이상 징후 감지 시 알림 생성
    """
    # VoiceHealthAnalysis 테이블에 저장
    analysis = VoiceHealthAnalysis(
        user_id=current_user.id,
        stress_level=data.stress_level,
        detected_emotion=data.overall_status,
        depression_indicator=data.depression_indicator,
        anxiety_indicator=data.anxiety_indicator,
        ai_health_suggestion=f"상시 모니터링 - {data.overall_status}",
        analysis_timestamp=datetime.fromisoformat(data.timestamp.replace('Z', '+00:00'))
    )

    db.add(analysis)

    # 우려 상태인 경우 알림 생성
    if data.overall_status == 'concern':
        notification = HealthNotification(
            user_id=current_user.id,
            notification_type="alert",
            title="정신 건강 주의",
            message=f"상시 모니터링 결과 주의가 필요한 정신 상태가 감지되었습니다. 스트레스: {data.stress_level}/10, 불안: {int(data.anxiety_indicator * 100)}%, 우울: {int(data.depression_indicator * 100)}%",
            tts_narration="주의가 필요한 정신 상태가 감지되었습니다. 잠시 휴식을 취하시거나 전문가와 상담하시기 바랍니다.",
            priority="high"
        )
        db.add(notification)

    await db.commit()
    await db.refresh(analysis)

    return {
        "success": True,
        "analysis_id": analysis.id,
        "message": "분석 결과가 저장되었습니다."
    }


@router.get("/continuous-analysis/history")
async def get_continuous_analysis_history(
    hours: int = 24,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    상시 모니터링 기록 조회
    - 지정된 시간 동안의 정신 상태 변화 추이
    """
    from datetime import timedelta

    cutoff_time = datetime.now() - timedelta(hours=hours)

    result = await db.execute(
        select(VoiceHealthAnalysis)
        .where(
            VoiceHealthAnalysis.user_id == current_user.id,
            VoiceHealthAnalysis.analysis_timestamp >= cutoff_time
        )
        .order_by(VoiceHealthAnalysis.analysis_timestamp.desc())
    )

    analyses = result.scalars().all()

    # 통계 계산
    if analyses:
        avg_stress = sum(a.stress_level or 0 for a in analyses) / len(analyses)
        avg_anxiety = sum(a.anxiety_indicator or 0 for a in analyses) / len(analyses)
        avg_depression = sum(a.depression_indicator or 0 for a in analyses) / len(analyses)

        concern_count = sum(1 for a in analyses if a.detected_emotion == 'concern')
    else:
        avg_stress = 0
        avg_anxiety = 0
        avg_depression = 0
        concern_count = 0

    return {
        "analyses": [
            {
                "timestamp": a.analysis_timestamp.isoformat(),
                "stress_level": a.stress_level,
                "anxiety_indicator": a.anxiety_indicator,
                "depression_indicator": a.depression_indicator,
                "overall_status": a.detected_emotion,
            }
            for a in analyses
        ],
        "statistics": {
            "total_analyses": len(analyses),
            "average_stress": round(avg_stress, 2),
            "average_anxiety": round(avg_anxiety, 2),
            "average_depression": round(avg_depression, 2),
            "concern_events": concern_count,
            "monitoring_hours": hours
        }
    }
