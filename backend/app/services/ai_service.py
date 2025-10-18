from typing import List, Dict, Optional
import random


class AIService:
    """테스트용 Mock AI 서비스 (API 호출 없음)"""

    def __init__(self):
        self.model = "mock-ai-service"

    async def symptom_check(
        self, message: str, user_context: Optional[Dict] = None
    ) -> Dict[str, str]:
        """증상 체크 및 분석 (Mock 응답)"""

        message_lower = message.lower()

        # 응급도 판단
        urgency_level = "low"

        # 응급 키워드 체크
        emergency_keywords = ["가슴 통증", "호흡곤란", "의식 잃", "심한 출혈", "쓰러", "응급"]
        high_keywords = ["가슴", "호흡", "심한 통증", "고열", "심각", "피", "출혈", "악성종양", "암", "우울증"]
        medium_keywords = ["두통", "복통", "열", "기침", "감기"]

        if any(keyword in message_lower for keyword in emergency_keywords):
            urgency_level = "emergency"
        elif any(keyword in message_lower for keyword in high_keywords):
            urgency_level = "high"
        elif any(keyword in message_lower for keyword in medium_keywords):
            urgency_level = "medium"

        # 권장 조치
        suggested_actions = {
            "emergency": "즉시 119에 연락하거나 가까운 응급실로 가세요.",
            "high": "가능한 빨리 병원을 방문하시거나 전문의 상담을 받으세요.",
            "medium": "증상이 지속되거나 악화되면 병원을 방문하세요.",
            "low": "경과를 지켜보시고 증상이 지속되면 병원을 방문하세요."
        }

        # 증상별 맞춤 응답 생성
        response = self._generate_symptom_response(message_lower, urgency_level, user_context)

        return {
            "response": response,
            "urgency_level": urgency_level,
            "suggested_action": suggested_actions[urgency_level],
        }

    def _generate_symptom_response(self, message: str, urgency_level: str, user_context: Optional[Dict]) -> str:
        """증상에 맞는 응답 생성"""

        # 암/종양 관련
        if "암" in message or "종양" in message or "악성" in message:
            if "우울" in message or "우울증" in message:
                return """갑상선 악성종양 진단을 받으신 후 우울감을 느끼시는 것은 매우 자연스러운 반응입니다. 이런 상황에서 정신적 어려움을 겪는 것은 당연합니다.

**정신 건강 관리 방법:**

1. **전문가 상담**: 정신건강의학과 전문의나 심리상담사와 상담하는 것을 강력히 권장합니다. 암 환자를 위한 심리지원 프로그램도 많이 있습니다.

2. **지지 그룹 참여**: 같은 경험을 한 환자 모임이나 온라인 커뮤니티에 참여하면 큰 도움이 됩니다.

3. **가족과 소통**: 가족이나 가까운 친구들과 감정을 나누세요.

4. **규칙적인 생활**:
   - 매일 가벼운 산책이나 운동
   - 충분한 수면
   - 균형 잡힌 식사
   - 명상이나 요가

5. **긍정적 활동**:
   - 좋아하는 취미 활동
   - 햇빛 쬐기
   - 음악 듣기
   - 일기 쓰기

**중요한 점:**
- 우울증은 치료 가능한 질환입니다
- 암 치료와 정신 건강 관리를 병행하는 것이 중요합니다
- 혼자 견디지 마시고 주변의 도움을 받으세요
- 한국 암 환자 지원센터(☎1577-8899)에 문의하시면 전문적인 도움을 받으실 수 있습니다

⚠️ 이것은 정보 제공 목적이며 의학적 진단이나 치료를 대체할 수 없습니다. 반드시 담당 의료진과 상담하시기 바랍니다."""
            else:
                return """갑상선 악성종양에 대해 말씀하시는군요. 이는 전문적인 의료 상담이 필요한 중요한 건강 문제입니다.

**중요 안내:**
1. 담당 의료진과 긴밀히 상담하세요
2. 정확한 진단과 치료 계획을 따르세요
3. 정기적인 검진과 추적 관찰이 중요합니다

⚠️ 본 서비스는 정보 제공 목적이며, 전문 의료인의 진단과 치료를 대체할 수 없습니다."""

        # 두통
        elif "두통" in message or "머리" in message and "아프" in message:
            return """두통을 겪고 계시는군요. 두통은 다양한 원인으로 발생할 수 있습니다.

**일반적인 두통 관리법:**
- 충분한 수분 섭취
- 어두운 방에서 휴식
- 카페인 섭취 줄이기
- 스트레스 관리
- 규칙적인 수면 패턴 유지

**병원 방문이 필요한 경우:**
- 갑작스럽고 심한 두통
- 점점 악화되는 두통
- 발열, 구토 동반
- 시야 이상이나 어지러움 동반

경과를 지켜보시고 증상이 지속되거나 악화되면 병원을 방문하세요."""

        # 감기/기침
        elif "감기" in message or "기침" in message or "콧물" in message:
            return """감기 증상을 겪고 계시는군요.

**자가 관리 방법:**
- 충분한 휴식
- 따뜻한 물 자주 마시기
- 비타민C 섭취
- 손 자주 씻기
- 실내 습도 유지 (50-60%)

**병원 방문이 필요한 경우:**
- 38도 이상 고열이 3일 이상 지속
- 호흡 곤란
- 가래에 피가 섞임
- 증상이 2주 이상 지속

대부분의 감기는 1-2주 내에 자연 회복됩니다."""

        # 복통
        elif "복통" in message or "배" in message and "아프" in message:
            return """복통을 겪고 계시는군요. 복통은 여러 원인이 있을 수 있습니다.

**응급 상황 (즉시 응급실):**
- 갑작스럽고 극심한 통증
- 토혈이나 혈변
- 딱딱하게 굳은 배
- 지속적인 구토

**일반적인 관리:**
- 자극적인 음식 피하기
- 소량씩 자주 식사
- 스트레스 관리
- 따뜻한 물 마시기

증상이 지속되거나 악화되면 소화기내과 진료를 받으세요."""

        # 우울증/스트레스
        elif "우울" in message or "스트레스" in message or "불안" in message:
            return """정신적으로 힘든 시간을 보내고 계시는군요. 도움을 요청하신 것은 매우 현명한 선택입니다.

**즉시 실천 가능한 방법:**
1. **전문가 도움**: 정신건강의학과 상담을 권장합니다
2. **규칙적인 생활**: 일정한 시간에 기상하고 취침
3. **운동**: 하루 30분 가벼운 산책
4. **사회적 연결**: 가족, 친구와 소통
5. **긍정적 활동**: 좋아하는 취미 활동

**긴급 도움이 필요하시면:**
- 자살예방 상담전화: ☎1393
- 정신건강 위기상담: ☎1577-0199
- 24시간 운영

혼자 견디지 마시고 전문가의 도움을 받으세요. 우울증은 치료 가능한 질환입니다."""

        # 기본 응답
        else:
            responses = [
                f"""증상에 대해 말씀해 주셔서 감사합니다.

현재 증상을 주의 깊게 관찰하시고, 다음 사항을 기록해두시면 좋습니다:
- 증상이 시작된 시기
- 증상의 강도와 빈도
- 증상을 악화시키거나 완화시키는 요인
- 동반 증상

증상이 지속되거나 악화되면 의료 전문가와 상담하시기 바랍니다.

⚠️ 본 서비스는 정보 제공 목적이며, 의학적 진단이나 치료를 대체할 수 없습니다.""",
            ]
            return random.choice(responses)

    async def mental_health_assessment(
        self,
        stress_level: Optional[int],
        anxiety_level: Optional[int],
        mood_level: Optional[int],
        sleep_quality: Optional[int],
        notes: Optional[str],
    ) -> Dict[str, str]:
        """정신 건강 평가 및 조언 (Mock 응답)"""

        # 전반적인 상태 평가
        avg_score = sum(filter(None, [stress_level, anxiety_level, mood_level, sleep_quality])) / 4

        if avg_score >= 7 or (mood_level and mood_level <= 3):
            severity = "high"
        elif avg_score >= 5 or (mood_level and mood_level <= 5):
            severity = "medium"
        else:
            severity = "low"

        # 평가 응답 생성
        assessment_responses = {
            "high": f"""정신 건강 상태를 체크해주셔서 감사합니다. 현재 상태를 살펴보니 주의가 필요한 수준으로 보입니다.

**현재 상태 분석:**
- 스트레스: {stress_level}/10 {"(높음)" if stress_level and stress_level >= 7 else ""}
- 불안: {anxiety_level}/10 {"(높음)" if anxiety_level and anxiety_level >= 7 else ""}
- 기분: {mood_level}/10 {"(낮음)" if mood_level and mood_level <= 4 else ""}
- 수면 질: {sleep_quality}/10 {"(나쁨)" if sleep_quality and sleep_quality <= 4 else ""}

**중요한 권고사항:**
전문적인 도움을 받으시는 것을 강력히 권장합니다. 정신건강의학과 전문의나 상담사와 상담하시면 큰 도움이 될 것입니다.

**긴급 지원:**
- 정신건강 위기상담: ☎1577-0199
- 자살예방 상담전화: ☎1393

지금 느끼는 감정은 매우 자연스러운 것이며, 전문가의 도움을 받으면 충분히 개선될 수 있습니다.""",

            "medium": f"""정신 건강 상태를 확인해주셔서 감사합니다.

**현재 상태 분석:**
- 스트레스: {stress_level}/10
- 불안: {anxiety_level}/10
- 기분: {mood_level}/10
- 수면 질: {sleep_quality}/10

일부 영역에서 어려움을 겪고 계시는 것으로 보입니다. 지금부터 관리를 시작하시면 충분히 개선될 수 있습니다.

**도움이 되는 활동:**
- 규칙적인 운동과 야외 활동
- 명상이나 요가
- 좋아하는 취미 활동
- 가족, 친구와 소통
- 충분한 수면

증상이 계속되거나 악화되면 전문가 상담을 고려해보세요.""",

            "low": f"""정신 건강 상태를 확인해주셔서 감사합니다.

**현재 상태 분석:**
- 스트레스: {stress_level}/10
- 불안: {anxiety_level}/10
- 기분: {mood_level}/10
- 수면 질: {sleep_quality}/10

전반적으로 건강한 상태를 유지하고 계시는 것으로 보입니다. 이 좋은 상태를 계속 유지하시면 좋겠습니다.

**계속 유지하면 좋은 습관:**
- 규칙적인 생활 패턴
- 적절한 운동
- 충분한 수면
- 긍정적인 사회 활동
- 스트레스 관리"""
        }

        assessment = assessment_responses.get(severity, assessment_responses["medium"])

        # 권장사항 생성
        recommendations = []

        if stress_level and stress_level >= 7:
            recommendations.append("- 하루 10-15분 명상이나 심호흡 연습하기")
            recommendations.append("- 규칙적인 운동 (걷기, 요가 등)")
            recommendations.append("- 스트레스 관리 프로그램 참여 고려")

        if anxiety_level and anxiety_level >= 7:
            recommendations.append("- 불안 관리 기법 배우기 (호흡법, 이완법)")
            recommendations.append("- 카페인 섭취 줄이기")
            recommendations.append("- 걱정 일기 쓰기")

        if mood_level and mood_level <= 4:
            recommendations.append("⚠️ 정신건강의학과 전문의 상담을 강력히 권장합니다")
            recommendations.append("- 가족이나 친구와 대화 시간 갖기")
            recommendations.append("- 햇빛 쬐며 야외 활동하기")
            recommendations.append("- 긍정적인 활동 계획하기")

        if sleep_quality and sleep_quality <= 4:
            recommendations.append("- 규칙적인 수면 시간 유지하기")
            recommendations.append("- 취침 1시간 전 스크린 사용 줄이기")
            recommendations.append("- 편안한 수면 환경 만들기 (어둡고 시원하게)")
            recommendations.append("- 카페인은 오후 2시 이후 피하기")

        if not recommendations:
            recommendations.append("현재 상태를 잘 유지하고 계십니다. 긍정적인 생활 습관을 계속 이어가세요.")

        return {
            "assessment": assessment,
            "recommendations": "\n".join(recommendations),
        }

    async def health_advice(
        self, record_type: str, value: float, user_context: Optional[Dict] = None
    ) -> str:
        """건강 기록에 대한 조언 (Mock 응답)"""

        advice_templates = {
            "혈압": self._blood_pressure_advice(value),
            "혈당": self._blood_sugar_advice(value),
            "체중": self._weight_advice(value, user_context),
            "체온": self._temperature_advice(value),
            "심박수": self._heart_rate_advice(value),
        }

        return advice_templates.get(record_type, f"""**{record_type} 측정값: {value}**

측정값을 기록해주셔서 감사합니다. 지속적으로 건강 수치를 모니터링하는 것은 매우 중요합니다.

**일반 권장사항:**
- 정기적으로 같은 시간에 측정하세요
- 변화 추이를 관찰하세요
- 이상한 값이 지속되면 의사와 상담하세요
- 건강한 생활습관을 유지하세요

⚠️ 본 정보는 참고용이며, 의학적 진단을 대체할 수 없습니다.""")

    def _blood_pressure_advice(self, systolic: float) -> str:
        """혈압 조언"""
        if systolic >= 140:
            return f"""**수축기 혈압: {systolic} mmHg (높음)**

혈압이 높은 편입니다. 고혈압은 심혈관 질환의 위험 요인입니다.

**권장사항:**
- 즉시 의사와 상담하세요
- 염분 섭취 줄이기
- 규칙적인 유산소 운동
- 체중 관리
- 스트레스 관리
- 금연, 절주

정상 혈압: 120/80 mmHg 미만"""

        elif systolic >= 120:
            return f"""**수축기 혈압: {systolic} mmHg (주의)**

혈압이 정상 범위보다 약간 높습니다 (주의 단계).

**권장사항:**
- 생활습관 개선으로 관리 가능
- 염분 섭취 줄이기
- 규칙적인 운동
- 체중 관리
- 정기적인 혈압 체크

정상 혈압: 120/80 mmHg 미만"""

        else:
            return f"""**수축기 혈압: {systolic} mmHg (정상)**

혈압이 정상 범위입니다. 잘 관리하고 계십니다!

**유지 방법:**
- 건강한 식습관 유지
- 규칙적인 운동
- 적절한 체중 유지
- 스트레스 관리

계속 좋은 상태를 유지하세요!"""

    def _blood_sugar_advice(self, value: float) -> str:
        """혈당 조언"""
        if value >= 126:
            return f"""**공복 혈당: {value} mg/dL (높음)**

혈당이 당뇨병 진단 기준을 초과합니다.

**즉시 필요한 조치:**
- 내분비내과 전문의 상담 필수
- 당뇨병 검사 받기
- 식이 조절 시작

**생활습관 개선:**
- 당분, 탄수화물 섭취 줄이기
- 규칙적인 운동
- 체중 관리

정상 공복 혈당: 100 mg/dL 미만"""

        elif value >= 100:
            return f"""**공복 혈당: {value} mg/dL (주의)**

혈당이 정상보다 높습니다 (전당뇨 단계).

**권장사항:**
- 식이 조절로 관리 가능
- 당분, 정제 탄수화물 줄이기
- 규칙적인 운동 (주 150분)
- 체중 감량 (과체중인 경우)
- 정기적인 혈당 검사

정상 공복 혈당: 100 mg/dL 미만"""

        else:
            return f"""**공복 혈당: {value} mg/dL (정상)**

혈당이 정상 범위입니다!

**유지 방법:**
- 균형 잡힌 식사
- 규칙적인 운동
- 적절한 체중 유지
- 정기 건강검진

계속 건강한 상태를 유지하세요!"""

    def _weight_advice(self, weight: float, user_context: Optional[Dict]) -> str:
        """체중 조언"""
        return f"""**현재 체중: {weight} kg**

체중을 기록해주셨습니다.

**건강한 체중 관리:**
- 균형 잡힌 식사
- 규칙적인 운동
- 충분한 수면
- 스트레스 관리
- 급격한 체중 변화 피하기

**체중 변화가 있다면:**
- 한 달에 2-4kg 정도가 건강한 감량 속도
- 급격한 증가/감소는 의사와 상담
- 체성분 검사도 고려해보세요

지속적으로 기록하며 추이를 관찰하세요!"""

    def _temperature_advice(self, temp: float) -> str:
        """체온 조언"""
        if temp >= 38.0:
            return f"""**체온: {temp}°C (발열)**

고열이 있습니다.

**권장사항:**
- 충분한 휴식
- 수분 섭취
- 해열제 복용 (필요시)
- 38.5°C 이상이거나 3일 이상 지속시 병원 방문
- 영유아나 노인은 즉시 의사 상담

정상 체온: 36.5-37.5°C"""

        elif temp >= 37.5:
            return f"""**체온: {temp}°C (미열)**

약간 높은 체온입니다.

**권장사항:**
- 휴식과 수분 섭취
- 경과 관찰
- 다른 증상이 동반되면 병원 방문

정상 체온: 36.5-37.5°C"""

        elif temp < 36.0:
            return f"""**체온: {temp}°C (저체온)**

체온이 낮습니다.

**권장사항:**
- 따뜻한 환경으로 이동
- 따뜻한 음료 마시기
- 증상이 지속되면 의사 상담

정상 체온: 36.5-37.5°C"""

        else:
            return f"""**체온: {temp}°C (정상)**

정상 체온입니다!

정상 체온 범위: 36.5-37.5°C
체온은 시간대에 따라 약간씩 변할 수 있습니다."""

    def _heart_rate_advice(self, rate: float) -> str:
        """심박수 조언"""
        if rate >= 100:
            return f"""**심박수: {rate} bpm (빠름)**

심박수가 빠릅니다 (빈맥).

**가능한 원인:**
- 운동, 스트레스, 불안
- 카페인, 탈수
- 발열, 빈혈

**권장사항:**
- 휴식 후 재측정
- 지속되면 의사 상담
- 가슴 두근거림, 어지러움 동반시 즉시 병원

정상 안정시 심박수: 60-100 bpm"""

        elif rate < 60:
            return f"""**심박수: {rate} bpm (느림)**

심박수가 느립니다 (서맥).

**참고:**
- 운동선수는 정상일 수 있음
- 일반인은 의사 상담 권장
- 어지러움, 실신 증상 있으면 즉시 병원

정상 안정시 심박수: 60-100 bpm"""

        else:
            return f"""**심박수: {rate} bpm (정상)**

정상 범위의 심박수입니다!

정상 안정시 심박수: 60-100 bpm

**건강한 심장 유지:**
- 규칙적인 유산소 운동
- 금연
- 스트레스 관리
- 건강한 식습관"""
