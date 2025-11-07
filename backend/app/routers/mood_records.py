from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta
import json

from ..database import get_db
from ..models.user import User
from ..models.mood_record import MoodRecord, MoodLevel
from ..schemas.mood_record import MoodRecordCreate, MoodRecordResponse, MoodStats
from ..dependencies import get_current_user
from ..config import settings
import google.generativeai as genai

router = APIRouter(prefix="/api/mood-records", tags=["mood-records"])

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


def get_ai_mood_analysis(mood_data: dict) -> tuple[str, str]:
    """Gemini API를 사용한 감정 분석 및 조언"""
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')

        # 감정 데이터를 한글로 매핑
        mood_korean = {
            "very_happy": "매우 행복함",
            "happy": "행복함",
            "neutral": "보통",
            "sad": "슬픔",
            "very_sad": "매우 슬픔",
            "angry": "화남",
            "anxious": "불안함",
            "stressed": "스트레스",
            "tired": "피곤함",
            "excited": "신남"
        }

        mood_text = mood_korean.get(mood_data.get("mood_level", ""), mood_data.get("mood_level", ""))
        intensity = mood_data.get("mood_intensity", 5)
        note = mood_data.get("note", "")
        activities = mood_data.get("activities", [])
        triggers = mood_data.get("triggers", [])

        prompt = f"""
당신은 공감력 높은 정신건강 전문가입니다. 사용자의 감정 기록을 분석하고 따뜻한 조언을 제공해주세요.

**감정 기록:**
- 감정 상태: {mood_text}
- 감정 강도: {intensity}/10
- 메모: {note if note else "없음"}
- 활동: {", ".join(activities) if activities else "없음"}
- 감정 유발 요인: {", ".join(triggers) if triggers else "없음"}

다음 두 가지를 제공해주세요:

1. **감정 분석** (2-3문장): 현재 감정 상태에 대한 전문적이지만 따뜻한 분석
2. **조언** (3-4문장): 구체적이고 실천 가능한 조언

응답 형식:
[분석]
분석 내용...

[조언]
조언 내용...
"""

        response = model.generate_content(prompt)
        full_response = response.text

        # 응답 파싱
        analysis = ""
        advice = ""

        if "[분석]" in full_response and "[조언]" in full_response:
            parts = full_response.split("[조언]")
            analysis = parts[0].replace("[분석]", "").strip()
            advice = parts[1].strip()
        else:
            # 파싱 실패 시 전체를 조언으로
            analysis = f"{mood_text} 상태를 기록해주셨군요. 감정 강도는 {intensity}/10입니다."
            advice = full_response.strip()

        return analysis, advice

    except Exception as e:
        print(f"AI analysis error: {e}")
        # 기본 메시지 반환
        return (
            f"현재 {mood_text} 상태를 경험하고 계시는군요. 감정을 기록해주셔서 감사합니다.",
            "규칙적인 감정 기록은 자신을 더 잘 이해하는 데 도움이 됩니다. 계속해서 기록해주세요."
        )


@router.post("/", response_model=MoodRecordResponse)
async def create_mood_record(
    mood_data: MoodRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """새로운 감정 기록 생성 (AI 분석 포함)"""

    # AI 분석 수행
    analysis_data = {
        "mood_level": mood_data.mood_level,
        "mood_intensity": mood_data.mood_intensity,
        "note": mood_data.note,
        "activities": mood_data.activities,
        "triggers": mood_data.triggers
    }

    ai_analysis, ai_advice = get_ai_mood_analysis(analysis_data)

    # 리스트를 JSON 문자열로 변환
    activities_json = json.dumps(mood_data.activities, ensure_ascii=False) if mood_data.activities else None
    triggers_json = json.dumps(mood_data.triggers, ensure_ascii=False) if mood_data.triggers else None

    # 데이터베이스에 저장
    db_mood_record = MoodRecord(
        user_id=current_user.id,
        mood_level=mood_data.mood_level,
        mood_intensity=mood_data.mood_intensity,
        note=mood_data.note,
        activities=activities_json,
        triggers=triggers_json,
        ai_analysis=ai_analysis,
        ai_advice=ai_advice,
        recorded_at=mood_data.recorded_at or datetime.utcnow()
    )

    db.add(db_mood_record)
    db.commit()
    db.refresh(db_mood_record)

    return db_mood_record


@router.get("/", response_model=List[MoodRecordResponse])
async def get_mood_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """사용자의 감정 기록 목록 조회 (날짜 필터링 가능)"""

    query = db.query(MoodRecord).filter(MoodRecord.user_id == current_user.id)

    # 날짜 필터링
    if start_date:
        query = query.filter(MoodRecord.recorded_at >= start_date)
    if end_date:
        query = query.filter(MoodRecord.recorded_at <= end_date)

    # 최신순 정렬
    records = query.order_by(desc(MoodRecord.recorded_at)).offset(skip).limit(limit).all()

    return records


@router.get("/stats", response_model=MoodStats)
async def get_mood_stats(
    days: int = Query(30, ge=1, le=365, description="통계 기간 (일)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """감정 통계 조회"""

    # 기간 설정
    start_date = datetime.utcnow() - timedelta(days=days)

    # 기간 내 모든 기록 조회
    records = db.query(MoodRecord).filter(
        MoodRecord.user_id == current_user.id,
        MoodRecord.recorded_at >= start_date
    ).all()

    if not records:
        return MoodStats(
            average_mood=5.0,
            most_common_mood="neutral",
            mood_trend="stable",
            total_records=0,
            mood_distribution={}
        )

    # 감정별 점수 매핑 (부정적: 1-4, 중립: 5, 긍정적: 6-10)
    mood_scores = {
        "very_sad": 1,
        "sad": 3,
        "angry": 2,
        "anxious": 3,
        "stressed": 3,
        "tired": 4,
        "neutral": 5,
        "happy": 7,
        "very_happy": 9,
        "excited": 8
    }

    # 평균 감정 계산 (감정 수준 + 강도 조합)
    total_score = sum(
        mood_scores.get(r.mood_level.value, 5) * (r.mood_intensity / 10)
        for r in records
    )
    average_mood = total_score / len(records)

    # 가장 많은 감정
    mood_counts = {}
    for record in records:
        mood = record.mood_level.value
        mood_counts[mood] = mood_counts.get(mood, 0) + 1

    most_common_mood = max(mood_counts, key=mood_counts.get) if mood_counts else "neutral"

    # 감정 트렌드 (최근 7일 vs 이전 기간 비교)
    if len(records) >= 7:
        recent_records = [r for r in records if r.recorded_at >= datetime.utcnow() - timedelta(days=7)]
        older_records = [r for r in records if r.recorded_at < datetime.utcnow() - timedelta(days=7)]

        if recent_records and older_records:
            recent_avg = sum(mood_scores.get(r.mood_level.value, 5) for r in recent_records) / len(recent_records)
            older_avg = sum(mood_scores.get(r.mood_level.value, 5) for r in older_records) / len(older_records)

            if recent_avg > older_avg + 0.5:
                mood_trend = "improving"
            elif recent_avg < older_avg - 0.5:
                mood_trend = "declining"
            else:
                mood_trend = "stable"
        else:
            mood_trend = "stable"
    else:
        mood_trend = "stable"

    return MoodStats(
        average_mood=round(average_mood, 2),
        most_common_mood=most_common_mood,
        mood_trend=mood_trend,
        total_records=len(records),
        mood_distribution=mood_counts
    )


@router.get("/{mood_id}", response_model=MoodRecordResponse)
async def get_mood_record(
    mood_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """특정 감정 기록 조회"""

    record = db.query(MoodRecord).filter(
        MoodRecord.id == mood_id,
        MoodRecord.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="감정 기록을 찾을 수 없습니다")

    return record


@router.delete("/{mood_id}")
async def delete_mood_record(
    mood_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """감정 기록 삭제"""

    record = db.query(MoodRecord).filter(
        MoodRecord.id == mood_id,
        MoodRecord.user_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="감정 기록을 찾을 수 없습니다")

    db.delete(record)
    db.commit()

    return {"message": "감정 기록이 삭제되었습니다"}
