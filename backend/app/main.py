from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import init_db
from .config import settings
from .routers import (
    auth_router,
    chat_router,
    health_records_router,
    medications_router,
    mental_health_router,
    mood_records_router,
    meditation_router,
    music_therapy_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행"""
    # 시작 시 데이터베이스 초기화
    await init_db()
    print("데이터베이스 초기화 완료")
    yield
    # 종료 시 정리 작업
    print("앱 종료")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI 기반 건강 상담 챗봇 API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 설정 - 현재 모든 origin 허용 (프로덕션에서는 제한 필요)
import os

# 개발/프로덕션 구분
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://health-chatbot-dusky.vercel.app",
]

# 환경 변수로 추가 origins 지원
if os.getenv("FRONTEND_URL"):
    ALLOWED_ORIGINS.append(os.getenv("FRONTEND_URL"))

print(f"🌍 CORS Origins: {ALLOWED_ORIGINS}")
print(f"🔧 DEBUG MODE: {settings.DEBUG}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 임시로 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(health_records_router)
app.include_router(medications_router)
app.include_router(mental_health_router)
app.include_router(mood_records_router)
app.include_router(meditation_router)
app.include_router(music_therapy_router)


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "AI 건강 상담 챗봇 API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "healthy"}


# 법적 면책 조항 엔드포인트
@app.get("/api/disclaimer")
async def get_disclaimer():
    """의료 면책 조항"""
    return {
        "disclaimer": """
        ⚠️ 의료 면책 조항

        본 서비스는 정보 제공 목적으로만 사용됩니다.

        1. 본 서비스는 의학적 진단, 치료, 또는 전문적인 의료 조언을 제공하지 않습니다.
        2. 건강 관련 우려사항이 있는 경우 반드시 의사 또는 기타 자격을 갖춘 의료 전문가와 상담하십시오.
        3. 본 서비스의 정보로 인해 전문적인 의료 조언을 무시하거나 의료 전문가와의 상담을 지연하지 마십시오.
        4. 응급 상황인 경우 즉시 119에 연락하거나 가까운 응급실을 방문하십시오.
        5. 본 서비스 사용으로 인한 결과에 대해 당사는 책임을 지지 않습니다.

        본 서비스를 사용함으로써 귀하는 이 면책 조항을 읽고 이해하며 동의하는 것으로 간주됩니다.
        """
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
