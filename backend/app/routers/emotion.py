"""감정 분석 API 라우터"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from ..services.emotion_analyzer import get_emotion_analyzer
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/emotion", tags=["emotion"])


class EmotionAnalysisRequest(BaseModel):
    """감정 분석 요청"""
    text: str
    voice_analysis: Optional[Dict] = None  # 음성 톤 분석 결과 (선택)


class EmotionAnalysisResponse(BaseModel):
    """감정 분석 응답"""
    primary_emotion: str
    emotion_scores: Dict[str, float]
    sentiment: str
    intensity: float
    keywords: list
    emotion_icon: str
    analysis: str
    voice_analysis: Optional[Dict] = None
    response_style: str  # AI 응답 스타일


@router.post("/analyze", response_model=EmotionAnalysisResponse)
async def analyze_emotion(
    request: EmotionAnalysisRequest,
    current_user = Depends(get_current_user)
):
    """텍스트 (+ 음성) 감정 분석"""
    analyzer = get_emotion_analyzer()

    try:
        # 음성 톤 분석 포함 여부에 따라 분석
        if request.voice_analysis:
            result = await analyzer.analyze_combined_emotion(
                request.text,
                request.voice_analysis
            )
        else:
            result = await analyzer.analyze_text_emotion(request.text)

        # AI 응답 스타일 결정
        result['response_style'] = analyzer.get_emotion_response_style(result)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"감정 분석 실패: {str(e)}")
