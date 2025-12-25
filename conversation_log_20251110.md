# 애고(ego) 앱 개발 대화 로그
**날짜**: 2025년 11월 10일
**프로젝트**: 애고(ego) - AI 건강 관리 앱

---

## 프로젝트 개요

### 앱명
애고(ego)

### 슬로건
"태어나기 전부터 엄마 뱃속에 잉태된 후 일생을 신체적 건강관리, 정신적 건강관리, 질병적 건강관리가 주 목적이며 점점 더 건강해지는 건강관리 앱이면서 마이크를 통해 사용자의 신체적 정신적인 상태를 모니터링하고 신체건강과 정신적 건강관리를 자동으로 알아서 해주는 똑똑한 AI 건강 앱"

### 핵심 컨셉
- 사용자 일생을 관리하는 필수 앱
- 메인 화면은 "오늘" 중심
- AI 자동 건강관리
- 음성 기반 모니터링

---

## UI/UX 설계

### 메인 화면 구조

**1. 오늘 중심의 타임라인**
- 메인은 항상 "오늘" 날짜 표시
- 좌우 스와이프로 과거/미래 이동
  - 좌측 스와이프: 과거 기록 보기
  - 우측 스와이프: AI 제시 미래 건강 스케줄

**2. 제스처 인터랙션**
- 핀치 줌 (축소/확대):
  - 축소: 일 → 주 → 월 → 년 단위로 변경
  - 확대: 년 → 월 → 주 → 일 단위로 변경
- 상단 가운데 터치: 오늘 화면으로 즉시 복귀

**3. 오늘의 체크리스트**
- 오늘 해야 할 건강관리 항목
- 식단 조절 체크
- 복약 알림
- 운동 기록

**4. 식단 관리**
- 카메라로 식단 사진 촬영
- AI 이미지 분석
- AI 추천 식단과 일치도 표시 (퍼센트)
- 그날 자동 저장

**5. 플로팅 "헬시" 버튼**
- 화면 하단에 고정 위치 (fixed position)
- 스크롤해도 항상 표시
- 빠른 접근 메뉴 제공

---

## 구현 완료 기능

### 1. 백엔드 (FastAPI)

#### AI 식단 분석 시스템
- **파일**: `backend/app/services/ai_nutrition_analyzer.py`
- **기능**: Google Gemini Vision API를 사용한 식단 이미지 분석
- **분석 항목**:
  - 감지된 음식 목록
  - 칼로리 계산
  - 영양 성분 (단백질, 탄수화물, 지방)
  - 건강 점수 (1-10점)
  - AI 분석 및 추천사항
  - 이상적인 식단과의 일치도 (0-100%)

#### AI 건강 스케줄러
- **파일**: `backend/app/services/ai_health_scheduler.py`
- **기능**: 사용자 맞춤형 건강 관리 스케줄 생성
- **생성 항목**:
  - 식사 시간 및 추천 식단
  - 운동 스케줄
  - 복약 알림
  - 명상/휴식 시간
  - 수면 관리
  - 건강 체크업 일정

#### 식단 관리 API
- **파일**: `backend/app/routers/meals.py`
- **엔드포인트**:
  - `POST /api/meals/`: 식단 기록 생성
  - `POST /api/meals/upload-image`: 식단 사진 업로드
  - `POST /api/meals/{meal_id}/analyze`: AI 분석 요청
  - `GET /api/meals/`: 식단 목록 조회
  - `GET /api/meals/today`: 오늘의 식단 조회
  - `GET /api/meals/{meal_id}`: 특정 식단 조회
  - `DELETE /api/meals/{meal_id}`: 식단 삭제

#### 건강 스케줄 API
- **파일**: `backend/app/routers/health_schedule.py`
- **엔드포인트**:
  - `GET /api/health-schedule/`: 맞춤 건강 스케줄 조회
  - `GET /api/health-schedule/today`: 오늘의 스케줄 조회

#### 음성 건강 분석 API
- **파일**: `backend/app/routers/voice_health.py`
- **주요 기능**:
  - 상시 음성 모니터링 분석 결과 저장
  - 정신 건강 상태 추적
  - 이상 징후 자동 알림 생성

#### 데이터베이스 모델
- **User**: 사용자 정보 및 meals relationship 추가
- **Meal**: 식단 기록 (이미지, AI 분석 결과, 영양 정보)
- **VoiceHealthAnalysis**: 음성 분석 결과
- **HealthNotification**: 건강 알림

### 2. 프론트엔드 (React)

#### 메인 대시보드
- **파일**: `frontend/src/pages/DashboardPage.jsx`
- **구현 기능**:
  - 오늘 중심 UI
  - 좌우 스와이프 제스처 (과거/미래 이동)
  - 핀치 줌 제스처 (일/주/월/년 단위 전환)
  - 상단 헤더 터치로 오늘 복귀
  - 오늘의 건강 체크리스트 및 진행률
  - 빠른 액션 버튼 (식단 기록, 복약, 기분, 운동)

#### 식단 촬영 컴포넌트
- **파일**: `frontend/src/components/MealCapture.jsx`
- **구현 기능**:
  - 카메라 촬영 또는 이미지 선택
  - 식사 종류 선택 (아침/점심/저녁/간식)
  - AI 분석 요청 및 로딩 상태
  - 분석 결과 표시:
    - 건강 점수
    - 추천 식단 일치도
    - 감지된 음식 목록
    - 영양 정보 (칼로리, 단백질, 탄수화물, 지방)
    - AI 분석 및 추천사항

#### 상시 음성 모니터링 ⭐ 개선됨!
- **파일**: `frontend/src/components/ContinuousVoiceMonitor.jsx`
- **구현 기능**:
  - ✅ **앱 시작 시 자동 실행** (Electron 환경에서)
  - ✅ **백그라운드 모니터링** (Electron 앱에서 창 최소화해도 계속 실행)
  - ✅ Web Audio API를 사용한 실시간 음성 분석 (녹음 없음!)
  - ✅ 프라이버시 100% 보호 (메모리에서만 처리)
  - 실시간 정신 상태 분석:
    - 스트레스 수준 (0-10)
    - 불안 지표 (0-100%)
    - 우울 지표 (0-100%)
    - 에너지 레벨 (0-10)
  - ✅ **상태 변화 시 음성 안내** (TTS + 시스템 알림)
  - ✅ **건강 상태 변화 감지 시 자동 알림**
  - 분석 결과 백엔드 자동 저장

#### 플로팅 헬시 버튼
- **파일**: `frontend/src/components/FloatingHealthButton.jsx`
- **구현 기능**:
  - Fixed position (화면 하단 고정)
  - 스크롤 시에도 항상 표시
  - 빠른 접근 메뉴:
    - 채팅
    - 명상
    - 음악 치료
    - 기분 기록
    - 복약 관리

### 3. Electron 데스크톱 앱 ⭐ 완성!

#### 백그라운드 실행 시스템
- **파일**: `electron/main.js`, `electron/preload.js`
- **구현 기능**:
  - ✅ 시스템 트레이에 상주
  - ✅ 창 닫기 시 트레이로 최소화 (종료 안 됨)
  - ✅ **백그라운드에서 계속 모니터링**
  - ✅ 시스템 알림 (건강 상태 변화 시)
  - ✅ Electron IPC 통신:
    - `monitoring-status`: 모니터링 상태 업데이트
    - `health-status-change`: 건강 상태 변화 알림
    - `notification`: 일반 알림
  - ✅ 트레이 메뉴:
    - 앱 열기
    - 모니터링 상태 표시
    - 종료

#### 크로스 플랫폼 빌드 지원
- **Windows**: `.exe` (설치 파일 + 포터블)
- **MacOS**: `.dmg`, `.zip`
- **Linux**: `.AppImage`, `.deb`

### 4. 모바일 앱 준비 (Capacitor) ⭐ 신규!

#### 설정 파일
- **파일**: `capacitor.config.json`
- **지원 플랫폼**:
  - Android (APK, AAB)
  - iOS (IPA)
- **플러그인**:
  - Microphone (음성 모니터링)
  - LocalNotifications (건강 알림)
  - BackgroundTask (백그라운드 실행)
  - SplashScreen (시작 화면)

---

## 음성 모니터링 완성 상태 ✅

### 질문하신 내용
1. ✅ **앱 시작 시 자동 실행**: Electron 환경에서 자동으로 모니터링 시작
2. ✅ **다른 앱 이동 시에도 모니터링**: 백그라운드에서 계속 실행 (Electron/모바일 앱)
3. ✅ **상태 변화 시 음성 안내**: TTS + 시스템 알림으로 안내

### 구현 세부 사항

#### 자동 시작
```javascript
// Electron 환경이면 자동으로 시작
const shouldAutoStart = savedAutoStart === 'true' || window.electronAPI?.isElectron;
if (shouldAutoStart) {
  setTimeout(() => startMonitoring(), 1000);
}
```

#### 백그라운드 모니터링
```javascript
// 모니터링 시작 시 Electron에 알림
if (window.electronAPI) {
  window.electronAPI.updateMonitoringStatus(true);
}

// Electron에서 시스템 트레이 업데이트
tray.setToolTip('애고 (ego) - 모니터링 실행 중');
```

#### 상태 변화 알림
```javascript
// 우려 수준 감지 시
if (overall === 'concern') {
  // 1. TTS 음성 안내 (Web Speech API)
  const utterance = new SpeechSynthesisUtterance(alertMessage);
  window.speechSynthesis.speak(utterance);

  // 2. Electron 시스템 알림
  if (window.electronAPI) {
    window.electronAPI.sendHealthStatusChange({
      message: `스트레스: ${stress}/10, 불안: ${anxiety}%, 우울: ${depression}%`
    });
  }

  // 3. 백엔드에 저장
  sendAnalysisToBackend(newState);
}
```

---

## 크로스 플랫폼 배포 ✅

### 지원 플랫폼

| 플랫폼 | 빌드 방법 | 백그라운드 실행 | 상태 |
|--------|-----------|----------------|------|
| **Windows** | Electron | ✅ | ✅ 완성 |
| **MacOS** | Electron | ✅ | ✅ 완성 |
| **Linux** | Electron | ✅ | ✅ 완성 |
| **Android** | Capacitor | ✅ (서비스) | ✅ 설정 완료 |
| **iOS** | Capacitor | ⚠️ (제한적) | ✅ 설정 완료 |
| **웹 (PWA)** | React Build | ❌ | ✅ 지원 |

### 빌드 명령어

#### 데스크톱 (Electron)
```bash
# 개발 모드
npm run electron:dev

# 프로덕션 빌드 (현재 OS용)
npm run electron:build
```

#### 모바일 (Capacitor)
```bash
# Android
cd frontend && npm run build && cd ..
npx cap sync android
npx cap open android  # Android Studio에서 빌드

# iOS (MacOS 필수)
cd frontend && npm run build && cd ..
npx cap sync ios
npx cap open ios  # Xcode에서 빌드
```

---

## 기술 스택

### 백엔드
- **프레임워크**: FastAPI
- **데이터베이스**: SQLite (개발), PostgreSQL (프로덕션)
- **AI 엔진**: Google Gemini 1.5 Flash
  - Vision API (식단 이미지 분석)
  - Text Generation (건강 스케줄 생성)
- **인증**: JWT (JSON Web Token)
- **환경 변수**: python-dotenv

### 프론트엔드
- **프레임워크**: React 18
- **라우팅**: React Router v6
- **HTTP 클라이언트**: Axios
- **음성 처리**: Web Audio API
- **TTS**: Web Speech API

### 데스크톱
- **프레임워크**: Electron 39
- **빌드**: electron-builder
- **지원**: Windows, MacOS, Linux

### 모바일
- **프레임워크**: Capacitor 6
- **지원**: Android, iOS
- **플러그인**: Microphone, LocalNotifications, BackgroundTask

---

## 파일 구조

```
lp/
├── backend/                          # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   │   ├── meal.py
│   │   │   └── voice_health.py
│   │   ├── routers/
│   │   │   ├── meals.py
│   │   │   ├── health_schedule.py
│   │   │   └── voice_health.py
│   │   ├── services/
│   │   │   ├── ai_nutrition_analyzer.py
│   │   │   └── ai_health_scheduler.py
│   │   └── schemas/
│   └── .env
│
├── frontend/                         # React 프론트엔드
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   ├── components/
│   │   │   ├── MealCapture.jsx
│   │   │   ├── FloatingHealthButton.jsx
│   │   │   └── ContinuousVoiceMonitor.jsx
│   │   └── context/
│   └── package.json
│
├── electron/                         # Electron 데스크톱 앱
│   ├── main.js
│   ├── preload.js
│   └── icon.png
│
├── capacitor.config.json             # Capacitor 모바일 설정
├── package.json                      # Electron 빌드 설정
├── BUILD_INSTRUCTIONS.md             # 빌드 가이드
└── conversation_log_20251110.md      # 이 문서
```

---

## 실행 방법

### 백엔드 서버
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API 문서: http://localhost:8000/docs
- 서버: http://localhost:8000

### 프론트엔드 (웹)
```bash
cd frontend
npm install  # 처음 한 번만
npm run dev
```
- 앱: http://localhost:5173

### 데스크톱 앱 (Electron)
```bash
# 루트 디렉토리에서
npm install  # 처음 한 번만
npm run electron:dev
```
- 자동으로 프론트엔드 + Electron 실행

---

## 주요 특징

### 1. AI 기반 자동화
- ✅ 식단 이미지 자동 분석 (Google Gemini Vision)
- ✅ 맞춤형 건강 스케줄 자동 생성
- ✅ 음성 패턴으로 정신 건강 자동 모니터링

### 2. 프라이버시 중심 설계
- ✅ 음성 녹음 없음 (분석만)
- ✅ 로컬 처리 후 즉시 폐기
- ✅ 분석 결과(숫자)만 저장

### 3. 사용자 중심 UI/UX
- ✅ 직관적인 제스처 인터페이스
- ✅ 오늘 중심의 타임라인
- ✅ 항상 접근 가능한 플로팅 버튼
- ✅ 부드러운 애니메이션

### 4. 백그라운드 모니터링 ⭐
- ✅ **앱 시작 시 자동 실행**
- ✅ **다른 앱 사용 중에도 모니터링 계속**
- ✅ **시스템 트레이에 상주**
- ✅ **건강 상태 변화 시 즉시 알림**

### 5. 크로스 플랫폼 지원 ⭐
- ✅ Windows/MacOS/Linux (Electron)
- ✅ Android/iOS (Capacitor)
- ✅ 웹 브라우저 (PWA)

---

## 개발 완료 상태 ✅

### Phase 1: 핵심 기능 (완료)
- ✅ AI 식단 분석
- ✅ 메인 대시보드 (오늘 중심 UI)
- ✅ 제스처 인터페이션 (스와이프, 핀치 줌)
- ✅ 식단 촬영 및 저장
- ✅ 음성 모니터링 (수동)
- ✅ 플로팅 헬시 버튼

### Phase 2: 자동화 및 백그라운드 (완료)
- ✅ 음성 모니터링 자동 시작
- ✅ 백그라운드 실행 (Electron)
- ✅ 상태 변화 시 자동 알림
- ✅ AI 건강 스케줄러

### Phase 3: 크로스 플랫폼 배포 (완료)
- ✅ Electron 데스크톱 앱 (Windows/MacOS/Linux)
- ✅ Capacitor 모바일 설정 (Android/iOS)
- ✅ 빌드 가이드 작성

---

## 다음 단계 (선택사항)

### 기능 개선
1. AI 정확도 향상 (더 많은 학습 데이터)
2. 건강 데이터 시각화 (차트, 그래프)
3. 다국어 지원
4. 가족 구성원 관리

### 배포
1. Google Play Store 출시 (Android)
2. Apple App Store 출시 (iOS)
3. Microsoft Store 출시 (Windows)
4. 웹 호스팅 (Vercel, Netlify)

### 마케팅
1. 웹사이트 제작
2. 앱 소개 영상
3. SNS 홍보

---

## 참고 문서

- **빌드 가이드**: `BUILD_INSTRUCTIONS.md`
- **API 문서**: http://localhost:8000/docs
- **Git 저장소**: 현재 프로젝트

---

## 질문에 대한 답변 요약

### Q1: 음성 모니터링 자동 실행?
**A**: ✅ **완성!** Electron 환경에서 앱 시작 시 자동으로 모니터링 시작

### Q2: 다른 앱으로 이동해도 모니터링?
**A**: ✅ **완성!** Electron 데스크톱 앱에서 백그라운드 계속 실행, 시스템 트레이 상주

### Q3: 상태 변화 시 음성 안내?
**A**: ✅ **완성!** TTS 음성 안내 + 시스템 알림으로 건강 상태 변화 즉시 알림

### Q4: Android/iOS/Windows/MacOS/Linux 배포?
**A**: ✅ **모두 가능!**
- Windows/MacOS/Linux: Electron (완성, 바로 빌드 가능)
- Android/iOS: Capacitor (설정 완료, Android Studio/Xcode에서 빌드)
- 웹: React 빌드 후 배포 (Vercel, Netlify 등)

---

## 결론

**애고(ego) 앱은 이제 완전한 크로스 플랫폼 AI 건강 관리 앱으로 완성되었습니다!**

- ✅ 모든 핵심 기능 구현 완료
- ✅ 자동 음성 모니터링 및 백그라운드 실행
- ✅ 모든 플랫폼 배포 준비 완료
- ✅ 상태 변화 시 자동 알림 및 음성 안내

이제 `npm run electron:dev`로 데스크톱 앱을 실행하거나, `npm run electron:build`로 배포용 파일을 빌드할 수 있습니다!

---

**최종 업데이트**: 2025년 11월 10일
**작성자**: Claude Code AI Assistant
**버전**: 2.0 (크로스 플랫폼 완성)
