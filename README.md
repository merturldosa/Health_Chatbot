# AI 건강 상담 챗봇 (Health Chatbot)

AI 기반 건강 상담 및 관리 시스템입니다. **Google Gemini 1.5 Pro**를 활용하여 증상 분석, 건강 기록 관리, 복약 알림, 정신 건강 체크 등의 기능을 제공합니다.

## 주요 기능

### 1. 💬 증상 체크 챗봇
- AI 기반 증상 분석 및 상담
- 긴급도 평가 (low, medium, high, emergency)
- 권장 조치 제공
- 대화 기록 저장

### 2. 📊 건강 기록 관리
- 혈압, 혈당, 체중, 심박수 등 측정
- 시각화 차트로 추세 확인
- 기록 추가/삭제

### 3. 💊 복약 관리
- 약 복용 시간 설정
- 알림 기능
- 복용 기간 관리

### 4. 🧠 정신 건강 체크
- 스트레스, 불안, 기분, 수면 평가
- AI 기반 분석 및 조언
- 맞춤형 권장사항 제공

## 기술 스택

### 백엔드
- **FastAPI** - Python 웹 프레임워크
- **SQLAlchemy** - ORM
- **SQLite** - 데이터베이스 (개발), **PostgreSQL** (프로덕션)
- **Google Gemini 1.5 Pro** - AI 모델
- **Pydantic** - 데이터 검증
- **JWT** - 인증

### 프론트엔드
- **React** - UI 라이브러리
- **React Router** - 라우팅
- **Axios** - HTTP 클라이언트
- **Recharts** - 차트 라이브러리
- **Vite** - 빌드 도구

## 설치 및 실행

### 사전 요구사항
- Python 3.11+
- Node.js 16+
- **Google Gemini API 키** ([발급 방법](#gemini-api-키-발급))

### 1. Gemini API 키 발급

1. https://aistudio.google.com/app/apikey 방문
2. Google 계정으로 로그인
3. "Create API Key" 클릭
4. 생성된 API 키 복사 (안전한 곳에 보관)

무료 플랜: 분당 2 요청 제한

### 2. 저장소 클론
```bash
git clone <repository-url>
cd lp
```

### 3. 백엔드 설정

#### 2.1 가상환경 생성 및 활성화
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### 2.2 패키지 설치
```bash
pip install -r requirements.txt
```

#### 3.3 환경 변수 설정
`.env` 파일을 열어서 **GEMINI_API_KEY**를 설정합니다:

```env
# Google Gemini AI API
GEMINI_API_KEY=발급받은-실제-API-키-여기에-입력

# 나머지는 기본값 사용
```

**중요**: `GEMINI_API_KEY`를 실제 발급받은 키로 변경하세요!

#### 3.4 서버 실행
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API 문서는 http://localhost:8000/docs 에서 확인할 수 있습니다.

### 4. 프론트엔드 설정

#### 4.1 패키지 설치
```bash
cd ../frontend
npm install
```

#### 4.2 환경 변수 확인
`.env` 파일이 이미 설정되어 있습니다:

```env
VITE_API_URL=http://localhost:8000
```

#### 4.3 개발 서버 실행
```bash
npm run dev
```

프론트엔드는 http://localhost:5173 에서 실행됩니다.

## 💰 비용 안내

### Google Gemini 1.5 Pro
- **무료 플랜**: 분당 2 요청 (테스트 및 개인 프로젝트 충분)
- **유료 플랜**: Input $3.5/1M tokens, Output $10.50/1M tokens
- 예상 월 비용: $10-30 (사용량에 따라)

## 프로젝트 구조

```
health-chatbot/
├── backend/
│   ├── app/
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── routers/         # API 엔드포인트
│   │   ├── services/        # 비즈니스 로직
│   │   ├── schemas/         # Pydantic 스키마
│   │   ├── database.py      # DB 설정
│   │   ├── config.py        # 앱 설정
│   │   └── main.py          # FastAPI 앱
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── services/        # API 서비스
│   │   ├── context/         # Context API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
└── README.md
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 채팅
- `POST /api/chat/symptom-check` - 증상 체크
- `GET /api/chat/history/{session_id}` - 채팅 기록

### 건강 기록
- `POST /api/health-records/` - 기록 생성
- `GET /api/health-records/` - 기록 조회
- `GET /api/health-records/{id}` - 특정 기록 조회
- `DELETE /api/health-records/{id}` - 기록 삭제

### 복약 관리
- `POST /api/medications/` - 복약 정보 생성
- `GET /api/medications/` - 복약 목록 조회
- `GET /api/medications/{id}` - 특정 복약 정보 조회
- `PUT /api/medications/{id}` - 복약 정보 수정
- `DELETE /api/medications/{id}` - 복약 정보 삭제

### 정신 건강
- `POST /api/mental-health/` - 정신 건강 체크
- `GET /api/mental-health/` - 체크 목록 조회
- `GET /api/mental-health/{id}` - 특정 체크 조회

## 보안 및 법적 고려사항

### ⚠️ 의료 면책 조항

본 서비스는 **정보 제공 목적**으로만 사용됩니다.

1. 본 서비스는 의학적 진단, 치료, 또는 전문적인 의료 조언을 제공하지 않습니다.
2. 건강 관련 우려사항이 있는 경우 반드시 의사 또는 기타 자격을 갖춘 의료 전문가와 상담하십시오.
3. 본 서비스의 정보로 인해 전문적인 의료 조언을 무시하거나 의료 전문가와의 상담을 지연하지 마십시오.
4. 응급 상황인 경우 즉시 119에 연락하거나 가까운 응급실을 방문하십시오.

### 보안 권장사항

- **실제 운영 환경**에서는:
  - 강력한 SECRET_KEY 사용
  - HTTPS 사용 필수
  - 환경 변수를 안전하게 관리
  - 정기적인 보안 업데이트
  - 데이터베이스 암호화
  - GDPR/개인정보보호법 준수

## 개발

### 백엔드 개발
```bash
cd backend
uvicorn app.main:app --reload
```

### 프론트엔드 개발
```bash
cd frontend
npm run dev
```

### 빌드
```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 빌드된 파일은 dist/ 폴더에 생성됩니다
```

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 문의

문제가 있거나 제안사항이 있으시면 이슈를 등록해주세요.
