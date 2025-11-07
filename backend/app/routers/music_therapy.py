from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.music_therapy import MusicSession as MusicSessionModel
from ..schemas.music_therapy import (
    MusicSession,
    MusicSessionCreate,
    MusicProgramInfo
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/music", tags=["music"])


# 음악 치료 프로그램 목록
MUSIC_PROGRAMS = [
    {
        "id": "sleep_binaural",
        "name": "수면 유도 바이노럴 비트",
        "type": "binaural",
        "purpose": "sleep",
        "description": "델타파 바이노럴 비트로 깊은 수면 유도",
        "benefits": ["깊은 수면", "불면증 완화", "수면 질 향상"],
        "duration_minutes": 30,
        "youtube_url": "https://www.youtube.com/watch?v=WPni755-Krg"
    },
    {
        "id": "anxiety_relief",
        "name": "불안 완화 음악",
        "type": "classical",
        "purpose": "anxiety",
        "description": "차분한 클래식 음악으로 불안감 완화",
        "benefits": ["불안 감소", "심신 안정", "긴장 이완"],
        "duration_minutes": 20,
        "youtube_url": "https://www.youtube.com/watch?v=UfcAVejslrU"
    },
    {
        "id": "focus_alpha",
        "name": "집중력 향상 알파파",
        "type": "binaural",
        "purpose": "focus",
        "description": "알파파 바이노럴 비트로 집중력 향상",
        "benefits": ["집중력 증가", "창의성 향상", "업무 효율 증대"],
        "duration_minutes": 45,
        "youtube_url": "https://www.youtube.com/watch?v=WPni755-Krg"
    },
    {
        "id": "nature_rain",
        "name": "빗소리 힐링",
        "type": "nature",
        "purpose": "sleep",
        "description": "편안한 빗소리로 마음의 평화",
        "benefits": ["심신 이완", "스트레스 해소", "수면 유도"],
        "duration_minutes": 60,
        "youtube_url": "https://www.youtube.com/watch?v=mPZkdNFkNps"
    },
    {
        "id": "nature_ocean",
        "name": "파도 소리",
        "type": "nature",
        "purpose": "anxiety",
        "description": "잔잔한 파도 소리로 마음의 안정",
        "benefits": ["불안 감소", "명상 효과", "평온함"],
        "duration_minutes": 45,
        "youtube_url": "https://www.youtube.com/watch?v=WHPYKLNXM7w"
    },
    {
        "id": "healing_528hz",
        "name": "528Hz 힐링 주파수",
        "type": "healing_frequency",
        "purpose": "pain_relief",
        "description": "DNA 복구 주파수로 알려진 528Hz",
        "benefits": ["통증 완화", "세포 재생", "에너지 회복"],
        "duration_minutes": 30,
        "youtube_url": "https://www.youtube.com/watch?v=WQ_Yo06kqHA"
    },
    {
        "id": "healing_432hz",
        "name": "432Hz 우주 주파수",
        "type": "healing_frequency",
        "purpose": "anxiety",
        "description": "자연과 조화를 이루는 432Hz",
        "benefits": ["심신 조화", "스트레스 감소", "명상 깊이 증가"],
        "duration_minutes": 30,
        "youtube_url": "https://www.youtube.com/watch?v=wvJAgrUBF4w"
    },
    {
        "id": "forest_sounds",
        "name": "숲속 새소리",
        "type": "nature",
        "purpose": "focus",
        "description": "평화로운 숲속 자연의 소리",
        "benefits": ["집중력 향상", "자연 치유", "스트레스 해소"],
        "duration_minutes": 60,
        "youtube_url": "https://www.youtube.com/watch?v=xNN7iTA57jM"
    }
]


@router.get("/programs", response_model=List[MusicProgramInfo])
async def get_music_programs(
    purpose: str = None,
    music_type: str = None
):
    """음악 치료 프로그램 목록 조회 (필터링 가능)"""
    programs = MUSIC_PROGRAMS

    if purpose:
        programs = [p for p in programs if p["purpose"] == purpose]
    if music_type:
        programs = [p for p in programs if p["type"] == music_type]

    return programs


@router.get("/programs/{program_id}", response_model=MusicProgramInfo)
async def get_music_program(program_id: str):
    """특정 음악 치료 프로그램 상세 조회"""
    program = next((p for p in MUSIC_PROGRAMS if p["id"] == program_id), None)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="프로그램을 찾을 수 없습니다."
        )
    return program


@router.post("/sessions", response_model=MusicSession)
async def create_music_session(
    session: MusicSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """음악 치료 세션 기록 저장"""
    db_session = MusicSessionModel(
        user_id=current_user.id,
        **session.dict()
    )
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    return db_session


@router.get("/sessions", response_model=List[MusicSession])
async def get_music_sessions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 음악 치료 세션 기록 조회"""
    result = await db.execute(
        select(MusicSessionModel)
        .where(MusicSessionModel.user_id == current_user.id)
        .order_by(MusicSessionModel.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    sessions = result.scalars().all()
    return sessions


@router.delete("/sessions/{session_id}")
async def delete_music_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """음악 치료 세션 기록 삭제"""
    result = await db.execute(
        select(MusicSessionModel)
        .where(
            MusicSessionModel.id == session_id,
            MusicSessionModel.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="세션을 찾을 수 없습니다."
        )

    await db.delete(session)
    await db.commit()
    return {"message": "세션이 삭제되었습니다."}
