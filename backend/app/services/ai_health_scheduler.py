"""AI 건강 스케줄러 - 사용자 건강 데이터 기반 미래 스케줄 추천"""
import google.generativeai as genai
from typing import List, Dict
from datetime import datetime, timedelta
import os
import json


class HealthScheduler:
    """사용자의 건강 데이터를 분석하여 미래 건강 관리 스케줄을 추천"""

    def __init__(self):
        # Google API Key 설정
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.")

        genai.configure(api_key=api_key)
        # Gemini Pro - 더 정교한 건강 스케줄 생성
        self.model = genai.GenerativeModel("gemini-1.5-pro")

    async def generate_health_schedule(
        self,
        user_data: Dict,
        health_history: List[Dict],
        days_ahead: int = 7,
    ) -> List[Dict]:
        """
        사용자 건강 데이터를 기반으로 미래 건강 관리 스케줄을 생성

        Args:
            user_data: 사용자 기본 정보 (나이, 성별, 기저질환 등)
            health_history: 과거 건강 기록 (식단, 운동, 수면 등)
            days_ahead: 며칠 후까지 스케줄을 생성할지

        Returns:
            [
                {
                    'date': '2024-01-01',
                    'tasks': [
                        {
                            'type': 'meal',
                            'title': '건강한 아침 식사',
                            'time': '08:00',
                            'description': '...',
                            'priority': 'high'
                        },
                        ...
                    ]
                },
                ...
            ]
        """

        try:
            # 사용자 정보 요약
            user_summary = self._create_user_summary(user_data)
            history_summary = self._create_history_summary(health_history)

            # AI 프롬프트 생성
            prompt = f"""
당신은 전문 건강 관리 AI입니다. 사용자의 건강 데이터를 분석하여 앞으로 {days_ahead}일간의 맞춤형 건강 관리 스케줄을 생성해주세요.

## 사용자 정보
{user_summary}

## 최근 건강 기록
{history_summary}

## 요구사항
1. 매일 아침, 점심, 저녁 식사 시간에 맞춘 식단 추천
2. 규칙적인 운동 스케줄 (사용자 상태에 맞게)
3. 약 복용이 필요한 경우 복약 알림
4. 정신 건강을 위한 명상/휴식 시간
5. 수면 관리 (취침/기상 시간)
6. 건강 체크업 일정 (필요시)

## 응답 형식
반드시 아래와 같은 JSON 배열 형식으로 응답해주세요:

[
  {{
    "date": "YYYY-MM-DD",
    "tasks": [
      {{
        "type": "meal",
        "title": "작업 제목",
        "time": "HH:MM",
        "description": "상세 설명",
        "priority": "high|medium|low"
      }}
    ]
  }}
]

type은 다음 중 하나: meal, exercise, medication, meditation, sleep, checkup
오늘 날짜: {datetime.now().strftime('%Y-%m-%d')}
"""

            # Gemini API 호출
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()

            # JSON 파싱
            import re

            # JSON 부분만 추출
            json_match = re.search(r"```json\s*(.*?)\s*```", response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(1)
            else:
                # 배열로 시작하는 부분 찾기
                json_match = re.search(r"\[.*\]", response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)

            schedule = json.loads(response_text)

            return schedule

        except Exception as e:
            print(f"AI 스케줄 생성 오류: {str(e)}")
            # 오류 발생 시 기본 스케줄 반환
            return self._generate_default_schedule(days_ahead)

    def _create_user_summary(self, user_data: Dict) -> str:
        """사용자 정보를 텍스트로 요약"""
        summary = []
        if user_data.get("age"):
            summary.append(f"나이: {user_data['age']}세")
        if user_data.get("gender"):
            summary.append(f"성별: {user_data['gender']}")
        if user_data.get("chronic_conditions"):
            summary.append(f"기저질환: {user_data['chronic_conditions']}")
        if user_data.get("allergies"):
            summary.append(f"알레르기: {user_data['allergies']}")

        return "\n".join(summary) if summary else "정보 없음"

    def _create_history_summary(self, health_history: List[Dict]) -> str:
        """건강 기록을 텍스트로 요약"""
        if not health_history:
            return "최근 기록 없음"

        summary = []
        for record in health_history[:10]:  # 최근 10개만
            record_type = record.get("type", "unknown")
            date = record.get("date", "날짜 미상")
            description = record.get("description", "")

            summary.append(f"- [{date}] {record_type}: {description}")

        return "\n".join(summary)

    def _generate_default_schedule(self, days_ahead: int) -> List[Dict]:
        """기본 스케줄 생성 (AI 실패 시 폴백)"""
        schedule = []
        base_date = datetime.now()

        for i in range(days_ahead):
            current_date = base_date + timedelta(days=i)
            date_str = current_date.strftime("%Y-%m-%d")

            daily_tasks = [
                {
                    "type": "meal",
                    "title": "건강한 아침 식사",
                    "time": "08:00",
                    "description": "균형 잡힌 아침 식사를 하세요.",
                    "priority": "high",
                },
                {
                    "type": "meal",
                    "title": "영양가 있는 점심",
                    "time": "12:00",
                    "description": "단백질과 채소를 충분히 섭취하세요.",
                    "priority": "high",
                },
                {
                    "type": "exercise",
                    "title": "30분 걷기",
                    "time": "14:00",
                    "description": "가벼운 산책으로 활력을 되찾으세요.",
                    "priority": "medium",
                },
                {
                    "type": "meal",
                    "title": "가벼운 저녁 식사",
                    "time": "18:00",
                    "description": "저녁은 가볍게 드세요.",
                    "priority": "high",
                },
                {
                    "type": "meditation",
                    "title": "명상 10분",
                    "time": "20:00",
                    "description": "하루를 마무리하는 명상 시간",
                    "priority": "medium",
                },
            ]

            schedule.append({"date": date_str, "tasks": daily_tasks})

        return schedule


# 싱글톤 인스턴스
_scheduler_instance = None


def get_health_scheduler() -> HealthScheduler:
    """건강 스케줄러 싱글톤 인스턴스 반환"""
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = HealthScheduler()
    return _scheduler_instance
