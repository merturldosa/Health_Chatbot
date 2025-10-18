from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..models.chat_history import ChatHistory
from ..schemas.chat import ChatRequest, ChatResponse
from ..services.ai_service import AIService
from ..dependencies import get_current_user
import uuid

router = APIRouter(prefix="/api/chat", tags=["chat"])
ai_service = AIService()


@router.post("/symptom-check", response_model=ChatResponse)
async def symptom_check(
    chat_request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """증상 체크 챗봇"""

    user = current_user

    # 사용자 컨텍스트 준비
    user_context = {
        "age": user.age,
        "gender": user.gender,
        "chronic_conditions": user.chronic_conditions,
        "allergies": user.allergies,
    }

    # AI 응답 생성
    try:
        ai_response = await ai_service.symptom_check(
            chat_request.message, user_context
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 서비스 오류: {str(e)}")

    # 세션 ID 생성 또는 사용
    session_id = chat_request.session_id or str(uuid.uuid4())

    # 사용자 메시지 저장
    user_message = ChatHistory(
        user_id=user.id,
        chat_type=chat_request.chat_type,
        session_id=session_id,
        role="user",
        message=chat_request.message,
    )
    db.add(user_message)

    # AI 응답 저장
    assistant_message = ChatHistory(
        user_id=user.id,
        chat_type=chat_request.chat_type,
        session_id=session_id,
        role="assistant",
        message=ai_response["response"],
        urgency_level=ai_response["urgency_level"],
        suggested_action=ai_response["suggested_action"],
    )
    db.add(assistant_message)

    await db.commit()

    return ChatResponse(
        message=ai_response["response"],
        urgency_level=ai_response["urgency_level"],
        suggested_action=ai_response["suggested_action"],
        session_id=session_id,
    )


@router.get("/history/{session_id}")
async def get_chat_history(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """채팅 기록 조회"""

    result = await db.execute(
        select(ChatHistory)
        .where(ChatHistory.user_id == current_user.id, ChatHistory.session_id == session_id)
        .order_by(ChatHistory.created_at)
    )
    history = result.scalars().all()

    return [
        {
            "role": chat.role,
            "message": chat.message,
            "urgency_level": chat.urgency_level,
            "suggested_action": chat.suggested_action,
            "created_at": chat.created_at,
        }
        for chat in history
    ]
