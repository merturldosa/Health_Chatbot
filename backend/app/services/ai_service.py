from typing import List, Dict, Optional
import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from ..config import settings


class AIService:
    """Google Gemini API 기반 AI 건강 상담 서비스"""

    def __init__(self):
        # Gemini API 설정 (config의 settings 사용)
        api_key = settings.GEMINI_API_KEY

        # 임시 키인 경우 경고 (서버는 시작됨)
        if api_key == "temp-key-please-set-in-railway":
            print("⚠️ WARNING: Using temporary GEMINI_API_KEY. Please set in Railway environment variables!")

        genai.configure(api_key=api_key)

        # 모델 설정 - Gemini 1.5 Pro
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        # 안전 설정 - 의료 상담을 위해 일부 제한 완화
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        }

        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",  # Gemini 1.5 Flash (안정적)
            generation_config=generation_config,
            safety_settings=safety_settings
        )

        # System instruction을 프롬프트에 포함시킴 (구버전 호환)
        self.system_instruction = self._get_system_instruction()

    def _get_system_instruction(self) -> str:
        """AI 시스템 지침"""
        return """당신은 한국어 AI 건강 상담 어시스턴트입니다.

**역할 및 제약사항:**
1. 당신은 의사가 아니며, 의학적 진단이나 치료를 제공할 수 없습니다.
2. 정보 제공 목적으로만 조언을 제공합니다.
3. 응급 상황에서는 즉시 119에 연락하거나 응급실 방문을 권장합니다.
4. 심각한 증상이나 지속적인 증상은 반드시 의료 전문가 상담을 권장합니다.

**응답 방식:**
1. 친절하고 공감적인 어조를 유지합니다.
2. 의료 용어를 사용할 때는 쉽게 설명합니다.
3. 구체적이고 실용적인 조언을 제공합니다.
4. 항상 면책 조항을 포함합니다.

**응급 상황 키워드 감지:**
다음과 같은 증상은 즉시 응급실 방문을 권장합니다:
- 심한 가슴 통증, 호흡곤란
- 의식 소실, 극심한 두통
- 심한 출혈, 쓰러짐
- 자살 또는 자해 생각

**응답 구조:**
1. 공감 표현
2. 증상 분석 및 설명
3. 권장 조치사항 (생활습관, 자가 관리)
4. 병원 방문 필요 여부
5. 면책 조항

항상 한국어로 응답하고, 존댓말을 사용하세요."""

    async def symptom_check(
        self, message: str, user_context: Optional[Dict] = None
    ) -> Dict[str, str]:
        """증상 체크 및 분석 (Gemini API 사용)"""

        # 사용자 컨텍스트 정보 추가
        context_info = ""
        if user_context:
            context_info = f"\n\n**사용자 정보:**\n"
            if user_context.get("age"):
                context_info += f"- 나이: {user_context['age']}세\n"
            if user_context.get("gender"):
                context_info += f"- 성별: {user_context['gender']}\n"
            if user_context.get("medical_history"):
                context_info += f"- 병력: {user_context['medical_history']}\n"

        # 프롬프트 구성 (system instruction 포함)
        prompt = f"""{self.system_instruction}

사용자의 증상에 대해 상담해주세요.

**사용자 증상:**
{message}
{context_info}

**응답 요구사항:**
1. 증상에 대한 공감과 이해
2. 가능한 원인 및 설명 (일반적인 정보)
3. 자가 관리 방법 및 생활습관 조언
4. 병원 방문 필요성 판단
5. 응급 상황이면 즉시 119 연락 또는 응급실 방문 권장
6. 면책 조항 포함

또한 다음 형식으로 응급도를 평가해주세요:
- emergency: 즉시 응급실 방문 필요
- high: 빠른 시일 내 병원 방문 권장
- medium: 증상 지속 시 병원 방문
- low: 경과 관찰

응답의 마지막에 반드시 다음 형식으로 응급도를 명시하세요:
[URGENCY: emergency/high/medium/low]"""

        try:
            # Gemini API 호출
            response = self.model.generate_content(prompt)

            # 응답 텍스트 추출
            response_text = response.text

            # 응급도 추출
            urgency_level = "medium"  # 기본값
            if "[URGENCY:" in response_text:
                urgency_part = response_text.split("[URGENCY:")[-1].split("]")[0].strip()
                if urgency_part in ["emergency", "high", "medium", "low"]:
                    urgency_level = urgency_part
                # 응급도 태그 제거
                response_text = response_text.split("[URGENCY:")[0].strip()

            # 권장 조치
            suggested_actions = {
                "emergency": "⚠️ 즉시 119에 연락하거나 가까운 응급실로 가세요.",
                "high": "가능한 빨리 병원을 방문하시거나 전문의 상담을 받으세요.",
                "medium": "증상이 지속되거나 악화되면 병원을 방문하세요.",
                "low": "경과를 지켜보시고 증상이 지속되면 병원을 방문하세요."
            }

            return {
                "response": response_text,
                "urgency_level": urgency_level,
                "suggested_action": suggested_actions[urgency_level],
            }

        except Exception as e:
            # API 호출 실패 시 폴백 응답
            return {
                "response": f"""증상에 대해 말씀해 주셔서 감사합니다.

현재 AI 서비스에 일시적인 문제가 있어 자세한 상담을 제공하기 어렵습니다.

**권장사항:**
- 증상이 심각하거나 악화되면 즉시 병원을 방문하세요
- 응급 상황이면 119에 연락하세요
- 증상을 계속 관찰하고 기록해두세요

⚠️ 본 서비스는 정보 제공 목적이며, 의학적 진단이나 치료를 대체할 수 없습니다.

[오류: {str(e)}]""",
                "urgency_level": "medium",
                "suggested_action": "증상이 지속되거나 악화되면 병원을 방문하세요."
            }


    async def mental_health_assessment(
        self,
        stress_level: Optional[int],
        anxiety_level: Optional[int],
        mood_level: Optional[int],
        sleep_quality: Optional[int],
        notes: Optional[str],
    ) -> Dict[str, str]:
        """정신 건강 평가 및 조언 (Gemini API 사용)"""

        # 프롬프트 구성 (system instruction 포함)
        prompt = f"""{self.system_instruction}

사용자의 정신 건강 상태를 평가하고 조언해주세요.

**정신 건강 지표 (1-10 척도):**
- 스트레스 수준: {stress_level if stress_level else "기록 안 됨"}/10 (높을수록 스트레스가 높음)
- 불안 수준: {anxiety_level if anxiety_level else "기록 안 됨"}/10 (높을수록 불안이 높음)
- 기분 상태: {mood_level if mood_level else "기록 안 됨"}/10 (낮을수록 우울함)
- 수면 질: {sleep_quality if sleep_quality else "기록 안 됨"}/10 (낮을수록 수면의 질이 나쁨)

**사용자 메모:**
{notes if notes else "없음"}

**응답 요구사항:**
1. 현재 상태에 대한 공감과 이해
2. 각 지표에 대한 평가 및 설명
3. 전반적인 정신 건강 상태 평가
4. 구체적이고 실천 가능한 권장사항 제시
5. 전문가 상담 필요 여부 판단
6. 긴급 지원 연락처 안내 (필요시)
   - 정신건강 위기상담: ☎1577-0199
   - 자살예방 상담전화: ☎1393

**중요:**
- 기분 상태가 3 이하이거나 전반적으로 심각한 경우 전문가 상담 강력 권장
- 자살이나 자해 생각이 있다면 즉시 전문가 도움 필요
- 공감적이고 희망적인 메시지 전달

응답을 두 부분으로 나누어 주세요:
1. [ASSESSMENT] 전반적인 평가
2. [RECOMMENDATIONS] 구체적인 권장사항 (각 항목을 "-"로 시작)"""

        try:
            # Gemini API 호출
            response = self.model.generate_content(prompt)
            response_text = response.text

            # 평가와 권장사항 분리
            assessment = ""
            recommendations = ""

            if "[ASSESSMENT]" in response_text and "[RECOMMENDATIONS]" in response_text:
                parts = response_text.split("[RECOMMENDATIONS]")
                assessment = parts[0].replace("[ASSESSMENT]", "").strip()
                recommendations = parts[1].strip()
            else:
                # 구분자가 없으면 전체를 assessment로
                assessment = response_text
                recommendations = "전문가와 상담하여 맞춤형 조언을 받으시기 바랍니다."

            return {
                "assessment": assessment,
                "recommendations": recommendations,
            }

        except Exception as e:
            # API 호출 실패 시 폴백 응답
            avg_score = sum(filter(None, [stress_level, anxiety_level, mood_level, sleep_quality])) / 4 if any([stress_level, anxiety_level, mood_level, sleep_quality]) else 5

            fallback_assessment = f"""정신 건강 상태를 확인해주셔서 감사합니다.

**현재 상태 기록:**
- 스트레스: {stress_level if stress_level else '-'}/10
- 불안: {anxiety_level if anxiety_level else '-'}/10
- 기분: {mood_level if mood_level else '-'}/10
- 수면 질: {sleep_quality if sleep_quality else '-'}/10

현재 AI 서비스에 일시적인 문제가 있어 상세한 평가를 제공하기 어렵습니다.

⚠️ 정신 건강이 좋지 않다면 반드시 전문가와 상담하세요.

**긴급 지원:**
- 정신건강 위기상담: ☎1577-0199
- 자살예방 상담전화: ☎1393"""

            fallback_recommendations = """- 규칙적인 생활 패턴 유지
- 하루 30분 이상 운동
- 충분한 수면 (7-8시간)
- 가족, 친구와 소통
- 전문가 상담 고려"""

            return {
                "assessment": fallback_assessment,
                "recommendations": fallback_recommendations,
            }

    async def health_advice(
        self, record_type: str, value: float, user_context: Optional[Dict] = None
    ) -> str:
        """건강 기록에 대한 조언 (Gemini API 사용)"""

        # 사용자 컨텍스트 정보
        context_info = ""
        if user_context:
            context_info = "\n**사용자 정보:**\n"
            if user_context.get("age"):
                context_info += f"- 나이: {user_context['age']}세\n"
            if user_context.get("gender"):
                context_info += f"- 성별: {user_context['gender']}\n"

        # 프롬프트 구성 (system instruction 포함)
        prompt = f"""{self.system_instruction}

사용자의 건강 측정값에 대해 조언해주세요.

**측정 정보:**
- 측정 항목: {record_type}
- 측정값: {value}
{context_info}

**응답 요구사항:**
1. 측정값에 대한 평가 (정상/주의/위험 범위)
2. 정상 범위 기준 제시
3. 현재 값의 의미와 건강 영향 설명
4. 개선 또는 유지 방법 (생활습관, 식이, 운동)
5. 병원 방문 필요 여부
6. 면책 조항

**주요 측정 항목별 정상 범위:**
- 혈압(수축기): <120 mmHg (정상), 120-139 (주의), ≥140 (고혈압)
- 혈당(공복): <100 mg/dL (정상), 100-125 (전당뇨), ≥126 (당뇨)
- 체온: 36.5-37.5°C (정상), ≥38 (발열)
- 심박수: 60-100 bpm (정상)

친절하고 실용적인 조언을 제공하되, 의학적 진단은 피하세요."""

        try:
            # Gemini API 호출
            response = self.model.generate_content(prompt)
            return response.text

        except Exception as e:
            # API 호출 실패 시 폴백 응답
            return f"""**{record_type} 측정값: {value}**

측정값을 기록해주셔서 감사합니다. 현재 AI 서비스에 일시적인 문제가 있어 상세한 조언을 제공하기 어렵습니다.

**일반 권장사항:**
- 정기적으로 같은 시간에 측정하세요
- 변화 추이를 관찰하세요
- 이상한 값이 지속되면 의사와 상담하세요
- 건강한 생활습관을 유지하세요

⚠️ 본 정보는 참고용이며, 의학적 진단을 대체할 수 없습니다.

[오류: {str(e)}]"""
