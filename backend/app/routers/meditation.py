from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models.user import User
from ..models.meditation import MeditationSession as MeditationSessionModel
from ..schemas.meditation import (
    MeditationSession,
    MeditationSessionCreate,
    MeditationProgramInfo
)
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/meditation", tags=["meditation"])


# 명상/호흡 프로그램 목록 (하드코딩된 데이터)
MEDITATION_PROGRAMS = [
    {
        "id": "guided_5min",
        "name": "5분 가이드 명상",
        "type": "meditation",
        "duration_minutes": 5,
        "description": "짧고 집중적인 마음챙김 명상",
        "benefits": [
            "스트레스 감소",
            "집중력 향상",
            "빠른 마음 안정"
        ],
        "instructions": [
            "편안한 자세로 앉거나 누우세요",
            "눈을 감고 호흡에 집중하세요",
            "들어오고 나가는 숨을 관찰하세요",
            "생각이 떠오르면 다시 호흡으로 돌아오세요",
            "5분 동안 이 과정을 반복하세요"
        ]
    },
    {
        "id": "guided_10min",
        "name": "10분 가이드 명상",
        "type": "meditation",
        "duration_minutes": 10,
        "description": "중간 길이의 심화 명상",
        "benefits": [
            "깊은 이완",
            "감정 안정",
            "자기 인식 향상"
        ],
        "instructions": [
            "편안한 자세로 앉으세요",
            "천천히 심호흡을 3번 하세요",
            "온몸의 긴장을 풀어주세요",
            "호흡의 리듬을 느끼세요",
            "몸과 마음의 감각을 관찰하세요"
        ]
    },
    {
        "id": "guided_20min",
        "name": "20분 가이드 명상",
        "type": "meditation",
        "duration_minutes": 20,
        "description": "깊은 이완과 통찰을 위한 명상",
        "benefits": [
            "깊은 심신 이완",
            "스트레스 해소",
            "내면 평화",
            "통찰력 향상"
        ],
        "instructions": [
            "조용하고 편안한 공간을 찾으세요",
            "편안한 자세를 취하세요",
            "긴장을 풀고 호흡에 집중하세요",
            "신체 각 부위를 차례로 이완하세요",
            "현재 순간에 머물러 보세요"
        ]
    },
    {
        "id": "box_breathing",
        "name": "박스 호흡법",
        "type": "breathing",
        "duration_minutes": 5,
        "description": "4-4-4-4 리듬의 균형 잡힌 호흡",
        "benefits": [
            "불안 감소",
            "심박수 안정",
            "집중력 강화",
            "즉각적인 진정 효과"
        ],
        "instructions": [
            "4초 동안 코로 숨을 들이마시세요",
            "4초 동안 숨을 참으세요",
            "4초 동안 입으로 숨을 내쉬세요",
            "4초 동안 숨을 참으세요",
            "이 과정을 5분간 반복하세요"
        ]
    },
    {
        "id": "478_breathing",
        "name": "4-7-8 호흡법",
        "type": "breathing",
        "duration_minutes": 5,
        "description": "수면 유도 및 긴장 완화에 효과적",
        "benefits": [
            "수면 유도",
            "불안 해소",
            "긴장 이완",
            "혈압 안정"
        ],
        "instructions": [
            "4초 동안 코로 숨을 들이마시세요",
            "7초 동안 숨을 참으세요",
            "8초 동안 입으로 천천히 내쉬세요",
            "이 사이클을 4회 반복하세요",
            "필요시 여러 세트 진행하세요"
        ]
    }
]


@router.get("/programs", response_model=List[MeditationProgramInfo])
async def get_meditation_programs():
    """명상/호흡 프로그램 목록 조회"""
    return MEDITATION_PROGRAMS


@router.get("/programs/{program_id}", response_model=MeditationProgramInfo)
async def get_meditation_program(program_id: str):
    """특정 명상/호흡 프로그램 상세 조회"""
    program = next((p for p in MEDITATION_PROGRAMS if p["id"] == program_id), None)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="프로그램을 찾을 수 없습니다."
        )
    return program


@router.post("/sessions", response_model=MeditationSession)
async def create_meditation_session(
    session: MeditationSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """명상/호흡 세션 기록 저장"""
    db_session = MeditationSessionModel(
        user_id=current_user.id,
        **session.dict()
    )
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    return db_session


@router.get("/sessions", response_model=List[MeditationSession])
async def get_meditation_sessions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """사용자의 명상/호흡 세션 기록 조회"""
    result = await db.execute(
        select(MeditationSessionModel)
        .where(MeditationSessionModel.user_id == current_user.id)
        .order_by(MeditationSessionModel.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    sessions = result.scalars().all()
    return sessions


@router.delete("/sessions/{session_id}")
async def delete_meditation_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """명상/호흡 세션 기록 삭제"""
    result = await db.execute(
        select(MeditationSessionModel)
        .where(
            MeditationSessionModel.id == session_id,
            MeditationSessionModel.user_id == current_user.id
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
