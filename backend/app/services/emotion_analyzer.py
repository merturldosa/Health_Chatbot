"""감정 분석 서비스 - Gemini AI를 활용한 텍스트 감정 분석"""
import google.generativeai as genai
from typing import Dict
import os
import json


class EmotionAnalyzer:
    """텍스트와 음성에서 감정을 분석하는 서비스"""

    # 감정 아이콘 매핑
    EMOTION_ICONS = {
        "joy": "😊",
        "sadness": "😢",
        "anger": "😠",
        "fear": "😨",
        "anxiety": "😰",
        "neutral": "😐",
        "surprise": "😲",
        "disgust": "🤢",
    }

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

        genai.configure(api_key=api_key)
        # Gemini Pro - 감정 분석에 적합
        self.model = genai.GenerativeModel("gemini-1.5-pro")

    async def analyze_text_emotion(self, text: str) -> Dict:
        """
        텍스트에서 감정을 분석

        Args:
            text: 분석할 텍스트

        Returns:
            {
                'primary_emotion': 'sadness',  # 주요 감정
                'emotion_scores': {
                    'joy': 0.1,
                    'sadness': 0.7,
                    'anger': 0.0,
                    'fear': 0.1,
                    'anxiety': 0.3,
                    'neutral': 0.0
                },
                'sentiment': 'negative',  # positive, negative, neutral
                'intensity': 0.8,  # 감정 강도 (0-1)
                'keywords': ['힘들다', '답답하다'],  # 감정 관련 키워드
                'emotion_icon': '😢'
            }
        """
        prompt = f"""다음 텍스트의 감정을 분석해주세요.

텍스트: "{text}"

다음 형식의 JSON으로 답변해주세요:
{{
  "primary_emotion": "joy|sadness|anger|fear|anxiety|neutral|surprise|disgust 중 하나",
  "emotion_scores": {{
    "joy": 0.0~1.0 사이의 숫자,
    "sadness": 0.0~1.0 사이의 숫자,
    "anger": 0.0~1.0 사이의 숫자,
    "fear": 0.0~1.0 사이의 숫자,
    "anxiety": 0.0~1.0 사이의 숫자,
    "neutral": 0.0~1.0 사이의 숫자
  }},
  "sentiment": "positive|negative|neutral 중 하나",
  "intensity": 0.0~1.0 사이의 감정 강도,
  "keywords": ["감정을", "나타내는", "주요", "단어들"],
  "analysis": "간단한 감정 분석 설명 (1-2문장)"
}}

주의사항:
- emotion_scores의 모든 값의 합은 약 1.0이 되어야 합니다
- intensity는 감정의 강도를 나타냅니다 (0=매우 약함, 1=매우 강함)
- keywords는 감정을 나타내는 핵심 단어 3-5개만 추출
- analysis는 한국어로 간단히 설명"""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # JSON 파싱 (마크다운 코드 블록 제거)
            if result_text.startswith("```json"):
                result_text = result_text[7:]
            if result_text.startswith("```"):
                result_text = result_text[3:]
            if result_text.endswith("```"):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())

            # 감정 아이콘 추가
            primary = result.get("primary_emotion", "neutral")
            result["emotion_icon"] = self.EMOTION_ICONS.get(primary, "😐")

            return result

        except json.JSONDecodeError as e:
            print(f"JSON 파싱 오류: {e}")
            print(f"응답 텍스트: {result_text}")
            # 기본값 반환
            return self._get_default_emotion()
        except Exception as e:
            print(f"감정 분석 오류: {e}")
            return self._get_default_emotion()

    async def analyze_combined_emotion(
        self,
        text: str,
        voice_analysis: Dict = None
    ) -> Dict:
        """
        텍스트와 음성 톤을 결합한 종합 감정 분석

        Args:
            text: 분석할 텍스트
            voice_analysis: 음성 톤 분석 결과 (ContinuousVoiceMonitor에서)
                {
                    'stress_level': 7.5,
                    'anxiety_indicator': 0.6,
                    'overall_status': 'concern'
                }

        Returns:
            종합 감정 분석 결과
        """
        # 텍스트 감정 분석
        text_emotion = await self.analyze_text_emotion(text)

        if not voice_analysis:
            return text_emotion

        # 음성 톤 정보를 반영하여 감정 강도 조정
        combined = text_emotion.copy()

        # 스트레스와 불안 수치를 감정 점수에 반영
        stress = voice_analysis.get('stress_level', 0) / 10.0  # 0-1로 정규화
        anxiety = voice_analysis.get('anxiety_indicator', 0)

        # 불안/공포 감정 증폭
        if 'anxiety' in combined['emotion_scores']:
            combined['emotion_scores']['anxiety'] = min(
                1.0,
                combined['emotion_scores']['anxiety'] + anxiety * 0.3
            )

        # 감정 강도 조정
        combined['intensity'] = min(
            1.0,
            combined['intensity'] + stress * 0.2
        )

        # 음성 톤 정보 추가
        combined['voice_analysis'] = {
            'stress_level': voice_analysis.get('stress_level', 0),
            'anxiety': anxiety,
            'overall_status': voice_analysis.get('overall_status', 'normal')
        }

        combined['analysis'] = (
            f"{combined['analysis']} "
            f"음성 톤에서 스트레스 {stress*10:.1f}/10, "
            f"불안 {anxiety*100:.0f}%가 감지되었습니다."
        )

        return combined

    def _get_default_emotion(self) -> Dict:
        """기본 감정 분석 결과 (오류 시)"""
        return {
            "primary_emotion": "neutral",
            "emotion_scores": {
                "joy": 0.0,
                "sadness": 0.0,
                "anger": 0.0,
                "fear": 0.0,
                "anxiety": 0.0,
                "neutral": 1.0
            },
            "sentiment": "neutral",
            "intensity": 0.5,
            "keywords": [],
            "emotion_icon": "😐",
            "analysis": "감정을 분석할 수 없습니다."
        }

    def get_emotion_response_style(self, emotion_data: Dict) -> str:
        """
        감정에 따른 AI 응답 스타일 결정

        Returns:
            "empathetic" (공감적), "supportive" (지지적), "calm" (차분한), "neutral" (중립적)
        """
        primary = emotion_data.get("primary_emotion", "neutral")
        intensity = emotion_data.get("intensity", 0.5)
        sentiment = emotion_data.get("sentiment", "neutral")

        # 부정적 감정 + 높은 강도
        if sentiment == "negative" and intensity > 0.6:
            if primary in ["sadness", "anxiety", "fear"]:
                return "empathetic"  # 공감적
            elif primary == "anger":
                return "calm"  # 차분하게 진정시키기

        # 긍정적 감정
        if sentiment == "positive":
            return "supportive"  # 지지적

        return "neutral"  # 중립적


# 싱글톤 인스턴스
_emotion_analyzer = None

def get_emotion_analyzer() -> EmotionAnalyzer:
    """EmotionAnalyzer 싱글톤 인스턴스 반환"""
    global _emotion_analyzer
    if _emotion_analyzer is None:
        _emotion_analyzer = EmotionAnalyzer()
    return _emotion_analyzer
