# 채팅 및 감정 표현 기능 가이드

## 🎯 개요

애고(ego) 앱에 추가된 **1:1 채팅 기능**과 **채팅 후 감정 표현 기능**에 대한 가이드입니다.

## ✨ 주요 기능

### 1. 실시간 1:1 채팅
- Firebase Firestore 기반 실시간 메시지 송수신
- 사용자 목록 조회 및 대화 시작
- 메시지 읽음 상태 표시
- 대화방 목록 실시간 업데이트

### 2. 메시지 감정 분석
- 백엔드 Gemini AI를 통한 텍스트 감정 분석
- 메시지마다 감정 아이콘 및 레이블 표시
- 음성 입력 시 음성 톤 분석 통합

### 3. 채팅 후 감정 표현 (핵심 기능!)
- **내 감정 표현**: 대화 후 느낀 감정을 선택하고 강도 설정
- **상대방 감정 표현**: 상대방이 느낀 것으로 보이는 감정 추측
- 감정 확신도 설정 (얼마나 확실한지)
- 메모 추가 기능

### 4. 감정 분석 기능
- 감정 일치도 분석: 내가 느낀 감정 vs 상대방이 인지한 내 감정
- 대화 상대별 감정 패턴 분석
- 커뮤니케이션 개선 인사이트 제공

## 📁 구현된 파일 목록

### Firebase 설정
```
frontend/src/firebase/
  ├── config.js              # Firebase 초기화 설정
  └── firestoreService.js    # Firestore 데이터베이스 서비스

FIREBASE_SETUP.md            # Firebase 설정 가이드
```

### UI 컴포넌트
```
frontend/src/pages/
  ├── ChatPage.jsx           # 채팅 메인 페이지
  └── ChatPage.css

frontend/src/components/
  ├── ChatWindow.jsx         # 채팅 윈도우 (메시지 표시 및 전송)
  ├── ChatWindow.css
  ├── PostChatEmotionModal.jsx  # 감정 표현 모달 (2단계 UI)
  └── PostChatEmotionModal.css
```

### 인증 통합
```
frontend/src/context/
  └── AuthContext.jsx        # Firebase 인증 통합 추가
```

### 라우팅
```
frontend/src/App.jsx         # /messages 라우트 추가
```

## 🗄️ Firestore 데이터베이스 구조

### 컬렉션: `users`
사용자 프로필 정보
```javascript
{
  email: "user@example.com",
  displayName: "사용자 이름",
  photoURL: "https://...",
  createdAt: timestamp,
  lastSeen: timestamp
}
```

### 컬렉션: `conversations`
대화방 정보
```javascript
{
  participants: ["backend_1", "backend_2"],
  participantNames: {
    "backend_1": "사용자1",
    "backend_2": "사용자2"
  },
  lastMessage: "안녕하세요",
  lastMessageTime: timestamp,
  createdAt: timestamp
}
```

### 서브컬렉션: `conversations/{id}/messages`
개별 메시지
```javascript
{
  senderId: "backend_1",
  text: "안녕하세요",
  timestamp: timestamp,
  readBy: ["backend_1", "backend_2"],
  emotion: {
    primary_emotion: "joy",
    sentiment: "positive",
    intensity: 0.8,
    emotion_icon: "😊",
    voice_analysis: { /* 음성 톤 데이터 (선택) */ }
  }
}
```

### 컬렉션: `post_chat_emotions`
채팅 후 감정 표현 데이터
```javascript
{
  conversationId: "conv_123",
  userId: "backend_1",
  timestamp: timestamp,
  myEmotion: {
    primary: "joy",
    intensity: 7,           // 1-10
    notes: "즐거운 대화였어요",
    emotion_icon: "😊"
  },
  perceivedOtherEmotion: {
    primary: "calm",
    intensity: 6,
    confidence: 75,         // 0-100%
    emotion_icon: "😌"
  }
}
```

## 🚀 사용 방법

### 1. Firebase 프로젝트 설정

`FIREBASE_SETUP.md` 파일을 참조하여 Firebase 프로젝트를 설정하세요.

**핵심 단계:**
1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Firestore Database 생성 (위치: asia-northeast3 서울)
3. 웹 앱 등록 및 설정 코드 복사
4. `frontend/.env` 파일 생성:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

5. Firestore 보안 규칙 설정 (FIREBASE_SETUP.md 참조)

### 2. 앱 실행

```bash
# 프론트엔드 (이미 실행 중이면 자동 리로드됨)
npm run electron:dev

# 백엔드 (감정 분석 API)
cd backend
python -m uvicorn app.main:app --reload
```

### 3. 채팅 기능 사용

1. 애고 앱에 로그인
2. 네비게이션에서 **"메시지"** 또는 `/messages` 경로로 이동
3. ✏️ 버튼을 클릭하여 새 대화 시작
4. 메시지 입력 및 전송
5. 대화 종료 후 **"💭 감정 표현"** 버튼 클릭

### 4. 감정 표현 과정

**1단계: 내 감정**
- 15가지 감정 중 선택 (기쁨, 슬픔, 분노, 불안 등)
- 감정 강도 설정 (1-10)
- 메모 작성 (선택)

**2단계: 상대방 감정**
- 상대방이 느낀 것으로 보이는 감정 선택
- 감정 강도 설정
- 확신도 설정 (0-100%)

**결과:**
- Firestore에 저장
- 나중에 감정 일치도 분석 가능
- 커뮤니케이션 패턴 파악

## 📊 감정 분석 활용

### 감정 일치도 분석

두 사람의 감정 표현을 비교하여 커뮤니케이션 품질 평가:

```javascript
// firestoreService.js의 analyzeEmotionAlignment 함수 사용
const result = await analyzeEmotionAlignment(conversationId, userId1, userId2);

// 결과 예시
{
  alignmentPercentage: 75,  // 75% 일치
  totalComparisons: 10,
  matches: 7,
  user1EmotionCount: 12,
  user2EmotionCount: 10
}
```

**해석:**
- 75%: 대부분의 경우 서로의 감정을 정확히 인지함
- 50% 이하: 커뮤니케이션 개선 필요
- 90% 이상: 매우 좋은 정서적 연결

### 대화 상대별 감정 패턴

```javascript
const patterns = await analyzeEmotionPatternsByContact(userId);

// 결과 예시
[
  {
    conversationId: "conv_123",
    totalRecords: 15,
    dominantEmotion: "joy",
    avgIntensity: 7.2,
    emotionDistribution: {
      joy: 10,
      calm: 3,
      neutral: 2
    }
  }
]
```

## 🔐 보안 및 프라이버시

### Firestore 보안 규칙

설정된 보안 규칙:
- ✅ 사용자는 자신의 프로필만 읽기/쓰기 가능
- ✅ 대화 참여자만 해당 대화 및 메시지 접근 가능
- ✅ 감정 표현은 본인만 생성 가능
- ✅ 인증되지 않은 사용자는 모든 데이터 접근 불가

### 데이터 암호화

- ✅ Firebase는 기본적으로 전송 중 암호화 (HTTPS)
- ✅ 저장 데이터도 암호화됨
- ⚠️ 민감한 개인정보는 클라이언트에서 추가 암호화 권장

## 💡 주요 API 함수

### 사용자 관리
```javascript
import { createOrUpdateUser, getUserProfile, getAllUsers } from './firebase/firestoreService';

// 사용자 생성/업데이트
await createOrUpdateUser(userId, {
  email: "user@example.com",
  displayName: "사용자 이름"
});

// 사용자 프로필 가져오기
const result = await getUserProfile(userId);

// 모든 사용자 목록
const users = await getAllUsers(currentUserId);
```

### 대화방 관리
```javascript
import { getOrCreateConversation, subscribeToConversations } from './firebase/firestoreService';

// 대화방 생성 또는 찾기
const conv = await getOrCreateConversation(userId1, userId2, name1, name2);

// 실시간 구독
const unsubscribe = subscribeToConversations(userId, (conversations) => {
  console.log('대화방 업데이트:', conversations);
});
```

### 메시지 전송
```javascript
import { sendMessage, subscribeToMessages } from './firebase/firestoreService';

// 메시지 전송 (감정 데이터 포함)
await sendMessage(conversationId, senderId, "안녕하세요", emotionData);

// 실시간 메시지 구독
const unsubscribe = subscribeToMessages(conversationId, (messages) => {
  console.log('새 메시지:', messages);
});
```

### 감정 표현
```javascript
import { savePostChatEmotion, getPostChatEmotions } from './firebase/firestoreService';

// 감정 표현 저장
await savePostChatEmotion({
  conversationId: "conv_123",
  userId: "user_1",
  myEmotion: {
    primary: "joy",
    intensity: 8,
    notes: "좋은 대화였어요"
  },
  perceivedOtherEmotion: {
    primary: "calm",
    intensity: 6,
    confidence: 70
  }
});

// 감정 표현 기록 조회
const emotions = await getPostChatEmotions(conversationId);
```

## 🎨 UI/UX 특징

### 채팅 페이지
- **왼쪽 사이드바**: 대화방 목록, 새 대화 시작
- **오른쪽 메인**: 선택된 대화의 메시지 표시
- **메시지 버블**: 내 메시지(보라색 그라디언트), 상대 메시지(흰색)
- **감정 표시**: 메시지 하단에 아이콘 + 레이블
- **음성 톤 뱃지**: 🎙️ 음성 분석 데이터 포함 시 표시

### 감정 표현 모달
- **2단계 UI**: 내 감정 → 상대방 감정
- **15가지 감정**: 기쁨, 행복, 사랑, 흥분, 평온, 중립, 슬픔, 불안, 두려움, 분노, 좌절, 스트레스, 혼란, 놀람, 혐오
- **감정 강도 슬라이더**: 1-10 범위
- **확신도 슬라이더**: 0-100% 범위
- **메모 영역**: 자유롭게 감정 설명

## 🔄 기존 기능과의 통합

### AI 챗봇과의 차이점

| 구분 | AI 챗봇 (/chat) | P2P 채팅 (/messages) |
|------|-----------------|----------------------|
| 대상 | AI 헬시 | 다른 사용자 |
| 데이터 | 백엔드 DB | Firebase Firestore |
| 감정 분석 | 실시간 (Gemini) | 메시지당 + 대화 후 표현 |
| 용도 | 건강 상담, 증상 체크 | P2P 소통, 감정 공유 |

### 음성 기능 통합

- ChatBot에서 사용하는 음성 입력 기능을 P2P 채팅에도 적용 가능
- `voiceAnalyzer.js` 유틸리티 재사용
- 음성 톤 분석 결과를 메시지 감정 데이터에 포함

## 📈 향후 개선 계획

### Phase 2: 멀티미디어 지원
- 이미지/동영상 전송 (Firebase Storage)
- 음성 메시지 녹음/재생
- 파일 첨부 기능

### Phase 3: 고급 기능
- 그룹 채팅
- 푸시 알림 (Firebase Cloud Messaging)
- 메시지 검색
- 대화 내보내기

### Phase 4: 감정 인사이트
- 감정 일치도 대시보드
- 커뮤니케이션 개선 제안
- 상담사 매칭 시스템
- 감정 트렌드 시각화

## 🐛 트러블슈팅

### Firebase 초기화 실패
**증상**: 브라우저 콘솔에 "❌ Firebase 초기화 실패" 메시지

**해결방법**:
1. `.env` 파일이 `frontend/` 디렉토리에 있는지 확인
2. 환경변수 이름이 `VITE_` 접두사로 시작하는지 확인
3. Firebase Console에서 설정값 재확인
4. 앱 재시작 (`npm run electron:dev` 중단 후 재실행)

### 메시지가 전송되지 않음
**증상**: 메시지 입력 후 전송 버튼을 눌러도 반응 없음

**해결방법**:
1. Firestore 보안 규칙 확인 (FIREBASE_SETUP.md 참조)
2. 브라우저 콘솔에서 에러 메시지 확인
3. 네트워크 연결 상태 확인
4. Firebase Console에서 Firestore 데이터베이스가 활성화되었는지 확인

### 감정 분석 실패
**증상**: 메시지에 감정 아이콘이 표시되지 않음

**해결방법**:
1. 백엔드 서버가 실행 중인지 확인 (`http://localhost:8000`)
2. Gemini API 키가 설정되어 있는지 확인 (`backend/.env`)
3. 네트워크 요청 확인 (브라우저 개발자 도구 → Network)

## 📚 참고 자료

- [Firebase 공식 문서](https://firebase.google.com/docs)
- [Firestore 시작하기](https://firebase.google.com/docs/firestore/quickstart)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
- [감정 분석 이론](https://en.wikipedia.org/wiki/Emotion_classification)

## 💬 문의 및 피드백

기능 개선 제안이나 버그 리포트는 GitHub Issues를 이용해주세요.

---

**애고(ego) - 당신의 건강과 감정을 돌보는 AI 파트너** ❤️
