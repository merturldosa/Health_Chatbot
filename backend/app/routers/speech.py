"""음성 인식 API 라우터"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from ..services.speech_service import get_speech_service
from ..dependencies import get_current_user


router = APIRouter(prefix="/api/speech", tags=["speech"])


class SpeechToTextRequest(BaseModel):
    """음성 → 텍스트 변환 요청 (Base64)"""
    audio_base64: str
    language_code: Optional[str] = "ko-KR"
    encoding: Optional[str] = "WEBM_OPUS"  # WEBM_OPUS, LINEAR16, OGG_OPUS, MP3
    sample_rate_hertz: Optional[int] = 48000


class SpeechToTextResponse(BaseModel):
    """음성 → 텍스트 변환 응답"""
    success: bool
    transcript: str
    confidence: float
    error: Optional[str] = None


@router.post("/transcribe", response_model=SpeechToTextResponse)
async def transcribe_speech(
    request: SpeechToTextRequest,
    current_user = Depends(get_current_user)
):
    """
    음성을 텍스트로 변환 (Base64 오디오)

    - 프론트엔드에서 녹음한 오디오를 Base64로 인코딩하여 전송
    - Google Cloud Speech-to-Text API로 변환
    - 한국어 자동 구두점 추가
    """
    speech_service = get_speech_service()

    try:
        result = await speech_service.transcribe_base64_audio(
            audio_base64=request.audio_base64,
            language_code=request.language_code,
            encoding=request.encoding,
            sample_rate_hertz=request.sample_rate_hertz,
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"음성 인식 처리 실패: {str(e)}"
        )


@router.post("/transcribe-file", response_model=SpeechToTextResponse)
async def transcribe_speech_file(
    file: UploadFile = File(...),
    language_code: str = "ko-KR",
    encoding: str = "WEBM_OPUS",
    sample_rate_hertz: int = 48000,
    current_user = Depends(get_current_user)
):
    """
    음성 파일을 텍스트로 변환

    - 직접 오디오 파일을 업로드하여 변환
    - 지원 포맷: WebM, OGG, MP3, WAV 등
    """
    speech_service = get_speech_service()

    try:
        # 파일 읽기
        audio_content = await file.read()

        # 인코딩 타입 자동 감지 (파일 확장자 기반)
        if file.filename:
            if file.filename.endswith(".webm"):
                encoding = "WEBM_OPUS"
            elif file.filename.endswith(".ogg"):
                encoding = "OGG_OPUS"
            elif file.filename.endswith(".mp3"):
                encoding = "MP3"
            elif file.filename.endswith(".wav"):
                encoding = "LINEAR16"

        from google.cloud import speech
        encoding_map = {
            "LINEAR16": speech.RecognitionConfig.AudioEncoding.LINEAR16,
            "WEBM_OPUS": speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            "OGG_OPUS": speech.RecognitionConfig.AudioEncoding.OGG_OPUS,
            "MP3": speech.RecognitionConfig.AudioEncoding.MP3,
        }
        audio_encoding = encoding_map.get(
            encoding,
            speech.RecognitionConfig.AudioEncoding.WEBM_OPUS
        )

        result = await speech_service.transcribe_audio(
            audio_content=audio_content,
            language_code=language_code,
            encoding=audio_encoding,
            sample_rate_hertz=sample_rate_hertz,
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"음성 파일 처리 실패: {str(e)}"
        )
