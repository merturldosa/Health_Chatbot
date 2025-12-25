"""Google Cloud Speech-to-Text 서비스"""
import os
import base64
from google.cloud import speech
from google.oauth2 import service_account
from typing import Optional, Dict
import json


class SpeechService:
    """음성 텍스트 변환 서비스"""

    def __init__(self):
        """
        Google Cloud Speech-to-Text 클라이언트 초기화

        인증 방법:
        1. GOOGLE_APPLICATION_CREDENTIALS 환경변수에 서비스 계정 JSON 파일 경로 설정
        2. 또는 기본 Application Default Credentials (ADC) 사용
        """
        credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

        if credentials_path and os.path.exists(credentials_path):
            # 서비스 계정 JSON 파일로 인증
            credentials = service_account.Credentials.from_service_account_file(
                credentials_path
            )
            self.client = speech.SpeechClient(credentials=credentials)
            print(f"✅ Google Cloud STT: 서비스 계정 인증 ({credentials_path})")
        else:
            # ADC (Application Default Credentials) 사용
            # 로컬: gcloud auth application-default login
            # 프로덕션: Gemini API key로 인증 가능 (하지만 STT는 별도)
            try:
                self.client = speech.SpeechClient()
                print("✅ Google Cloud STT: ADC 인증")
            except Exception as e:
                print(f"⚠️ Google Cloud STT 초기화 실패: {e}")
                print("💡 해결방법:")
                print("  1. gcloud auth application-default login 실행")
                print("  2. 또는 GOOGLE_APPLICATION_CREDENTIALS 환경변수 설정")
                self.client = None

    async def transcribe_audio(
        self,
        audio_content: bytes,
        language_code: str = "ko-KR",
        encoding: speech.RecognitionConfig.AudioEncoding = speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
        sample_rate_hertz: int = 48000,
    ) -> Dict[str, any]:
        """
        음성을 텍스트로 변환

        Args:
            audio_content: 오디오 바이트 데이터
            language_code: 언어 코드 (기본: 한국어)
            encoding: 오디오 인코딩 형식
            sample_rate_hertz: 샘플링 레이트

        Returns:
            {
                'success': True/False,
                'transcript': '변환된 텍스트',
                'confidence': 0.95,
                'error': '에러 메시지 (실패 시)'
            }
        """
        if not self.client:
            return {
                "success": False,
                "transcript": "",
                "confidence": 0.0,
                "error": "Google Cloud STT 클라이언트가 초기화되지 않았습니다."
            }

        try:
            # 오디오 설정
            audio = speech.RecognitionAudio(content=audio_content)

            config = speech.RecognitionConfig(
                encoding=encoding,
                sample_rate_hertz=sample_rate_hertz,
                language_code=language_code,
                enable_automatic_punctuation=True,  # 자동 구두점
                model="default",  # 또는 'medical_conversation' (의료 대화 특화)
            )

            # 음성 인식 요청
            response = self.client.recognize(config=config, audio=audio)

            # 결과 처리
            if not response.results:
                return {
                    "success": False,
                    "transcript": "",
                    "confidence": 0.0,
                    "error": "음성을 인식할 수 없습니다."
                }

            # 가장 높은 confidence의 결과 반환
            result = response.results[0]
            alternative = result.alternatives[0]

            return {
                "success": True,
                "transcript": alternative.transcript,
                "confidence": alternative.confidence,
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "transcript": "",
                "confidence": 0.0,
                "error": f"음성 인식 오류: {str(e)}"
            }

    async def transcribe_base64_audio(
        self,
        audio_base64: str,
        language_code: str = "ko-KR",
        encoding: str = "WEBM_OPUS",
        sample_rate_hertz: int = 48000,
    ) -> Dict[str, any]:
        """
        Base64 인코딩된 오디오를 텍스트로 변환

        Args:
            audio_base64: Base64 인코딩된 오디오 데이터
            language_code: 언어 코드
            encoding: 오디오 인코딩 ("WEBM_OPUS", "LINEAR16", "MP3" 등)
            sample_rate_hertz: 샘플링 레이트

        Returns:
            transcribe_audio()와 동일
        """
        try:
            # Base64 디코딩
            audio_content = base64.b64decode(audio_base64)

            # 인코딩 문자열을 enum으로 변환
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

            return await self.transcribe_audio(
                audio_content,
                language_code,
                audio_encoding,
                sample_rate_hertz
            )

        except Exception as e:
            return {
                "success": False,
                "transcript": "",
                "confidence": 0.0,
                "error": f"Base64 디코딩 오류: {str(e)}"
            }


# 싱글톤 인스턴스
_speech_service = None

def get_speech_service() -> SpeechService:
    """SpeechService 싱글톤 인스턴스 반환"""
    global _speech_service
    if _speech_service is None:
        _speech_service = SpeechService()
    return _speech_service
