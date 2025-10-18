from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    """챗봇 요청 스키마"""

    message: str
    chat_type: str = "symptom_check"  # "symptom_check", "general_health", "mental_health"
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """챗봇 응답 스키마"""

    message: str
    urgency_level: Optional[str] = None
    suggested_action: Optional[str] = None
    session_id: str
