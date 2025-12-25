"""AI 영양 분석 서비스 - Google Gemini Vision API 사용"""
import google.generativeai as genai
from typing import Dict, Optional
import os
import base64
from io import BytesIO
from PIL import Image


class NutritionAnalyzer:
    """식단 이미지를 분석하여 영양 정보와 추천사항을 제공"""

    def __init__(self):
        # Google API Key 설정
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

        genai.configure(api_key=api_key)
        # Gemini Pro - 더 정확한 영양 분석
        self.model = genai.GenerativeModel("gemini-1.5-pro")

    def _decode_base64_image(self, base64_str: str) -> Image.Image:
        """Base64 문자열을 PIL Image로 변환"""
        # data:image/jpeg;base64, 부분 제거
        if "base64," in base64_str:
            base64_str = base64_str.split("base64,")[1]

        image_data = base64.b64decode(base64_str)
        return Image.open(BytesIO(image_data))

    async def analyze_meal(
        self,
        image_url: str,
        meal_type: str,
        user_health_goals: Optional[str] = None,
    ) -> Dict:
        """
        식단 이미지를 분석하여 영양 정보와 AI 추천사항을 반환

        Args:
            image_url: Base64 인코딩된 이미지 URL 또는 경로
            meal_type: 식사 종류 (breakfast, lunch, dinner, snack)
            user_health_goals: 사용자의 건강 목표 (선택사항)

        Returns:
            {
                'ai_analysis': '음식 분석 결과',
                'ai_recommendation': 'AI 추천사항',
                'match_percentage': 85.5,  # 건강한 식단과의 일치도
                'calories': 650.0,
                'protein': 25.5,
                'carbs': 85.0,
                'fat': 15.2,
                'detected_foods': ['현미밥', '닭가슴살', '샐러드'],
                'health_score': 8.5,  # 10점 만점
            }
        """

        try:
            # 이미지 로드
            image = self._decode_base64_image(image_url)

            # 한국어로 상세한 프롬프트 작성
            meal_type_kr = {
                "breakfast": "아침",
                "lunch": "점심",
                "dinner": "저녁",
                "snack": "간식",
            }.get(meal_type, meal_type)

            prompt = f"""
당신은 전문 영양사 AI입니다. 이 {meal_type_kr} 식사 이미지를 분석해주세요.

다음 정보를 JSON 형식으로 정확하게 제공해주세요:

1. detected_foods: 이미지에서 감지된 모든 음식 목록 (한글 배열)
2. calories: 총 칼로리 (kcal, 숫자)
3. protein: 단백질 (g, 숫자)
4. carbs: 탄수화물 (g, 숫자)
5. fat: 지방 (g, 숫자)
6. health_score: 이 식사의 건강 점수 (1-10, 숫자)
7. analysis: 이 식사에 대한 상세 분석 (3-4문장, 영양학적 관점)
8. recommendation: 더 건강한 식사를 위한 구체적인 추천사항 (3-4문장)
9. match_percentage: 이상적인 {meal_type_kr} 식사와의 일치도 (0-100, 숫자)

{f"사용자의 건강 목표: {user_health_goals}" if user_health_goals else ""}

응답은 반드시 아래와 같은 JSON 형식으로만 작성해주세요:
{{
  "detected_foods": ["음식1", "음식2"],
  "calories": 500,
  "protein": 25,
  "carbs": 60,
  "fat": 15,
  "health_score": 7.5,
  "analysis": "분석 내용...",
  "recommendation": "추천사항...",
  "match_percentage": 75
}}
"""

            # Gemini Vision API 호출
            response = self.model.generate_content([prompt, image])

            # JSON 파싱
            import json
            import re

            response_text = response.text.strip()

            # JSON 부분만 추출 (```json ... ``` 제거)
            json_match = re.search(r"```json\s*(.*?)\s*```", response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            else:
                # 중괄호로 시작하는 부분 찾기
                json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)

            result = json.loads(response_text)

            # 결과 검증 및 정리
            analyzed_data = {
                "ai_analysis": result.get("analysis", "분석 중 오류가 발생했습니다."),
                "ai_recommendation": result.get(
                    "recommendation", "추천사항을 생성할 수 없습니다."
                ),
                "match_percentage": float(result.get("match_percentage", 0)),
                "calories": float(result.get("calories", 0)),
                "protein": float(result.get("protein", 0)),
                "carbs": float(result.get("carbs", 0)),
                "fat": float(result.get("fat", 0)),
                "detected_foods": result.get("detected_foods", []),
                "health_score": float(result.get("health_score", 5.0)),
            }

            return analyzed_data

        except Exception as e:
            print(f"AI 분석 오류: {str(e)}")
            # 오류 발생 시 기본값 반환
            return {
                "ai_analysis": f"이미지 분석 중 오류가 발생했습니다: {str(e)}",
                "ai_recommendation": "나중에 다시 시도해주세요.",
                "match_percentage": 0.0,
                "calories": 0.0,
                "protein": 0.0,
                "carbs": 0.0,
                "fat": 0.0,
                "detected_foods": [],
                "health_score": 0.0,
            }


# 싱글톤 인스턴스
_analyzer_instance = None


def get_nutrition_analyzer() -> NutritionAnalyzer:
    """영양 분석기 싱글톤 인스턴스 반환"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = NutritionAnalyzer()
    return _analyzer_instance
