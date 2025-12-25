# Firebase 설정 가이드

## 🎯 개요

애고(ego) 앱의 실시간 채팅 및 감정 표현 기능을 위한 Firebase 설정 가이드입니다.

## 📋 설정 단계

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **"프로젝트 추가"** 클릭
3. 프로젝트 이름 입력 (예: `ego-health-app`)
4. Google Analytics 활성화 (선택사항)
5. 프로젝트 생성 완료

### 2. 웹 앱 등록

1. Firebase 프로젝트 설정 → **"앱 추가"** → **웹 아이콘** 클릭
2. 앱 닉네임 입력 (예: `애고 웹앱`)
3. **"앱 등록"** 클릭
4. Firebase SDK 설정 코드가 표시됨 (아래 형식):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ego-health-app.firebaseapp.com",
  projectId: "ego-health-app",
  storageBucket: "ego-health-app.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### 3. Firestore Database 생성

1. Firebase Console → **"Firestore Database"** → **"데이터베이스 만들기"**
2. 프로덕션 모드 시작 (또는 테스트 모드)
3. 위치 선택: **asia-northeast3 (서울)**
4. **"사용 설정"** 클릭

### 4. Firestore 보안 규칙 설정

Firebase Console → Firestore Database → **"규칙"** 탭에서 다음 규칙 적용:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 사용자 프로필 (본인만 읽기/쓰기)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 대화방 (참여자만 읽기)
    match /conversations/{conversationId} {
      allow read: if request.auth != null &&
                     request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       request.auth.uid in resource.data.participants;
    }

    // 메시지 (대화 참여자만 읽기/쓰기)
    match /conversations/{conversationId}/messages/{messageId} {
      allow read, write: if request.auth != null &&
                            request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
    }

    // 채팅 후 감정 표현 (본인만 쓰기, 참여자만 읽기)
    match /post_chat_emotions/{emotionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Firebase Storage 설정 (미디어 파일용)

1. Firebase Console → **"Storage"** → **"시작하기"**
2. 보안 규칙 선택 (프로덕션 모드)
3. 위치 선택: **asia-northeast3 (서울)**
4. **"완료"** 클릭

### 6. Firebase Authentication 설정

1. Firebase Console → **"Authentication"** → **"시작하기"**
2. 로그인 제공업체:
   - **이메일/비밀번호** 활성화
   - (선택) Google, Facebook 등 소셜 로그인 추가

### 7. 환경변수 설정

#### 방법 1: `.env` 파일 생성 (권장)

`frontend/.env` 파일 생성:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=ego-health-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ego-health-app
VITE_FIREBASE_STORAGE_BUCKET=ego-health-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

#### 방법 2: 직접 `frontend/src/firebase/config.js` 수정

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ego-health-app.firebaseapp.com",
  projectId: "ego-health-app",
  storageBucket: "ego-health-app.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### 8. .gitignore 업데이트

`frontend/.env` 파일을 Git에 커밋하지 않도록 `.gitignore`에 추가:

```
# 환경변수
.env
.env.local
.env.production
```

### 9. Firebase 라이브러리 설치

```bash
cd frontend
npm install
```

## 🗄️ Firestore 데이터베이스 스키마

### 컬렉션 구조

```
users/
  └── {userId}/
      ├── email: string
      ├── displayName: string
      ├── photoURL: string (optional)
      ├── createdAt: timestamp
      └── lastSeen: timestamp

conversations/
  └── {conversationId}/
      ├── participants: array<userId>
      ├── participantNames: map<userId, string>
      ├── lastMessage: string
      ├── lastMessageTime: timestamp
      ├── createdAt: timestamp
      └── messages/ (서브컬렉션)
          └── {messageId}/
              ├── senderId: string
              ├── text: string
              ├── emotion: object (optional)
              │   ├── primary_emotion: string
              │   ├── sentiment: string
              │   ├── intensity: number
              │   └── emotion_icon: string
              ├── timestamp: timestamp
              └── readBy: array<userId>

post_chat_emotions/
  └── {emotionId}/
      ├── conversationId: string
      ├── userId: string
      ├── timestamp: timestamp
      ├── myEmotion: object
      │   ├── primary: string
      │   ├── intensity: number (0-10)
      │   ├── notes: string (optional)
      │   └── emotion_icon: string
      └── perceivedOtherEmotion: object
          ├── primary: string
          ├── intensity: number (0-10)
          ├── confidence: number (0-100, 확신도)
          └── emotion_icon: string
```

## 🔍 초기화 확인

브라우저 개발자 도구 콘솔에서 다음 메시지 확인:

✅ **성공**: `✅ Firebase 초기화 성공`
❌ **실패**: `❌ Firebase 초기화 실패` + 에러 메시지

## 💰 요금

Firebase는 기본적으로 **무료 플랜(Spark)**을 제공합니다:

### Firestore 무료 할당량
- 저장용량: 1 GB
- 문서 읽기: 50,000/일
- 문서 쓰기: 20,000/일
- 문서 삭제: 20,000/일

### Storage 무료 할당량
- 저장용량: 5 GB
- 다운로드: 1 GB/일
- 업로드: 무제한

### 초과 시 요금
- [Firebase 가격](https://firebase.google.com/pricing)

## 🔐 보안 주의사항

1. ⚠️ **절대로** Firebase 설정 파일(.env)을 Git에 커밋하지 마세요
2. ✅ Firestore 보안 규칙을 반드시 설정하세요
3. ✅ 프로덕션 환경에서는 API 키 제한 설정 권장
4. ✅ 민감한 개인정보는 암호화하여 저장

## 📚 참고 자료

- [Firebase 시작하기](https://firebase.google.com/docs/web/setup)
- [Firestore 문서](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

## 🧪 테스트

Firebase 설정 완료 후:

1. 앱 실행: `npm run electron:dev`
2. 브라우저 콘솔에서 Firebase 초기화 메시지 확인
3. 채팅 기능 테스트
4. Firestore Console에서 데이터 생성 확인
