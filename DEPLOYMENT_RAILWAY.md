# Railway 배포 가이드

## 🚂 Railway 배포 단계

### 1. Railway 계정 생성
1. https://railway.app/ 방문
2. GitHub 계정으로 로그인
3. 무료 플랜 선택 ($5 credit/month)

### 2. 프로젝트 생성
1. Railway 대시보드에서 "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. `Health_Chatbot` 저장소 선택
4. "Deploy Now" 클릭

### 3. PostgreSQL 추가
1. 프로젝트 대시보드에서 "New" 클릭
2. "Database" → "PostgreSQL" 선택
3. 자동으로 `DATABASE_URL` 환경변수가 설정됨

### 4. 환경변수 설정
프로젝트 대시보드 → "Variables" 탭에서 다음 환경변수 추가:

```bash
# 필수
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your-secret-key-here

# 선택 (기본값 사용 가능)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=AI Health Chatbot
DEBUG=False
FRONTEND_URL=https://health-chatbot-dusky.vercel.app
```

**SECRET_KEY 생성 방법:**
```bash
openssl rand -hex 32
```

### 5. 배포 확인
1. 배포가 완료되면 Railway가 공개 URL 제공
2. `https://your-app.railway.app/docs` 에서 API 문서 확인
3. `https://your-app.railway.app/health` 에서 헬스 체크

### 6. 프론트엔드 연결
Vercel 환경변수에 백엔드 URL 추가:
1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. 새 변수 추가:
   - Name: `VITE_API_URL`
   - Value: `https://your-app.railway.app`
3. Redeploy

## 📊 현재 배포 상태

### 프론트엔드 (Vercel)
- URL: https://health-chatbot-dusky.vercel.app
- 자동 배포: main 브랜치 푸시 시

### 백엔드 (Railway)
- URL: (Railway 배포 후 추가 예정)
- Database: PostgreSQL (Railway 제공)
- 자동 배포: main 브랜치 푸시 시

## 🔧 로컬 테스트

PostgreSQL 연결 테스트:
```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL="postgresql+asyncpg://user:pass@localhost/dbname"
export GEMINI_API_KEY="your_key"
export SECRET_KEY="your_secret"
uvicorn app.main:app --reload
```

## 📝 주의사항

1. **무료 플랜 제한**:
   - 500시간/월 실행 시간
   - $5 credit/month
   - 충분한 트래픽 처리 가능

2. **데이터베이스**:
   - SQLite는 프로덕션에 부적합
   - Railway PostgreSQL 사용 필수

3. **환경변수**:
   - `.env` 파일은 절대 커밋하지 않기
   - Railway 대시보드에서만 설정

4. **CORS 설정**:
   - `backend/app/main.py`에 프론트엔드 URL 추가됨
   - Vercel URL이 이미 허용 목록에 있음

## 🚀 배포 후 테스트

1. 회원가입/로그인 테스트
2. AI 챗봇 대화 테스트
3. 감정 일기 기록 테스트
4. 건강 기록 추가 테스트

문제 발생 시 Railway Logs에서 에러 확인:
- Railway 대시보드 → 프로젝트 → Deployments → View Logs
