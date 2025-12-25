# 애고(ego) 앱 빌드 가이드

## 📦 크로스 플랫폼 배포 방법

애고(ego) 앱은 **Windows, MacOS, Linux, Android, iOS** 모든 플랫폼에서 실행 가능합니다.

---

## 🖥️ 데스크톱 앱 (Electron)

### 사전 준비
```bash
# 루트 디렉토리에서 Electron 종속성 설치
npm install
```

### 개발 모드 실행
```bash
# 프론트엔드 + Electron 동시 실행
npm run electron:dev
```

### 프로덕션 빌드

#### Windows
```bash
npm run electron:build
```
- 결과물: `dist-electron/애고 (ego) Setup.exe` (설치 파일)
- 결과물: `dist-electron/애고 (ego) Portable.exe` (포터블 버전)

#### MacOS
```bash
npm run electron:build
```
- 결과물: `dist-electron/애고 (ego).dmg`
- 결과물: `dist-electron/애고 (ego).zip`

#### Linux
```bash
npm run electron:build
```
- 결과물: `dist-electron/애고 (ego).AppImage`
- 결과물: `dist-electron/애고 (ego).deb`

### Electron 앱 특징
- ✅ 백그라운드에서 계속 실행
- ✅ 시스템 트레이에 상주
- ✅ 앱 종료 후에도 모니터링 계속 (트레이 아이콘)
- ✅ 시스템 알림 지원
- ✅ 자동 시작 옵션

---

## 📱 모바일 앱 (Capacitor)

### 사전 준비

#### Android
1. Android Studio 설치
2. Android SDK 설정
3. Java JDK 11+ 설치

#### iOS (MacOS 필수)
1. Xcode 설치
2. CocoaPods 설치: `sudo gem install cocoapods`

### Capacitor 설정
```bash
# 프론트엔드 빌드
cd frontend
npm run build
cd ..

# Capacitor 초기화 (처음 한 번만)
npm install @capacitor/core @capacitor/cli
npx cap init

# 플랫폼 추가
npx cap add android
npx cap add ios
```

### Android 앱 빌드

```bash
# 1. 프론트엔드 빌드
cd frontend
npm run build
cd ..

# 2. 웹 파일을 Android 프로젝트로 복사
npx cap sync android

# 3. Android Studio에서 열기
npx cap open android

# 4. Android Studio에서:
#    - Build > Generate Signed Bundle / APK
#    - APK 선택
#    - 키 스토어 생성 또는 선택
#    - Release 빌드 선택
```

결과물: `android/app/build/outputs/apk/release/app-release.apk`

### iOS 앱 빌드 (MacOS 전용)

```bash
# 1. 프론트엔드 빌드
cd frontend
npm run build
cd ..

# 2. 웹 파일을 iOS 프로젝트로 복사
npx cap sync ios

# 3. Xcode에서 열기
npx cap open ios

# 4. Xcode에서:
#    - 팀 선택 (Apple Developer Account 필요)
#    - Product > Archive
#    - Distribute App
#    - App Store Connect 또는 Ad Hoc 선택
```

결과물: `.ipa` 파일

### 모바일 앱 백그라운드 서비스

**Android**: `AndroidManifest.xml`에 권한 추가 필요
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

**iOS**: `Info.plist`에 권한 설명 추가 필요
```xml
<key>NSMicrophoneUsageDescription</key>
<string>음성 패턴을 분석하여 건강 상태를 모니터링합니다</string>
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>
```

---

## 🌐 웹 앱 (PWA)

### Progressive Web App 배포

```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 결과물: frontend/dist/
# Vercel, Netlify, Firebase Hosting 등에 배포
```

### 특징
- ✅ 설치 가능한 웹 앱
- ⚠️ 백그라운드 제한 (브라우저 제약)
- ⚠️ 마이크 권한 유지 제한

---

## 🔧 백엔드 배포

### Railway / Render / Heroku

```bash
# 1. PostgreSQL 데이터베이스 생성
# 2. 환경 변수 설정:
#    - DATABASE_URL
#    - GEMINI_API_KEY
#    - SECRET_KEY

# 3. 백엔드 배포
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Docker 배포

```bash
# Dockerfile 작성 (backend/)
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# 빌드 및 실행
docker build -t ego-backend .
docker run -p 8000:8000 ego-backend
```

---

## 📊 빌드 요약

| 플랫폼 | 빌드 명령 | 결과물 | 백그라운드 실행 |
|--------|-----------|--------|----------------|
| Windows | `npm run electron:build` | `.exe` | ✅ |
| MacOS | `npm run electron:build` | `.dmg`, `.zip` | ✅ |
| Linux | `npm run electron:build` | `.AppImage`, `.deb` | ✅ |
| Android | Android Studio | `.apk`, `.aab` | ✅ (서비스) |
| iOS | Xcode | `.ipa` | ⚠️ (제한적) |
| 웹 | `npm run build` | HTML/JS/CSS | ❌ |

---

## 🎯 권장 배포 전략

### 1단계: 데스크톱 우선
- Electron으로 Windows/MacOS/Linux 빌드
- 백그라운드 모니터링 완벽 지원
- 시스템 트레이 상주

### 2단계: 모바일 앱
- Android: Google Play Store 배포
- iOS: Apple App Store 배포 (Apple Developer Account 필요)

### 3단계: 웹 앱
- PWA로 웹 브라우저에서도 사용 가능
- 설치 프롬프트 제공

---

## 🔒 배포 전 체크리스트

### 보안
- [ ] `.env` 파일 제외 (`.gitignore`)
- [ ] API 키 환경 변수로 관리
- [ ] HTTPS 사용
- [ ] CORS 설정 제한

### 성능
- [ ] 프론트엔드 빌드 최적화
- [ ] 이미지 압축
- [ ] 코드 스플리팅

### 법적
- [ ] 개인정보 처리방침 작성
- [ ] 의료 면책 조항 표시
- [ ] 마이크 권한 사용 설명

### 테스트
- [ ] 각 플랫폼에서 테스트
- [ ] 백그라운드 실행 확인
- [ ] 알림 동작 확인
- [ ] 음성 모니터링 정확도 검증

---

## 🆘 문제 해결

### Electron 빌드 실패
- Node.js 버전 확인 (16 이상)
- `node_modules` 삭제 후 재설치

### Android 빌드 실패
- Java 버전 확인 (JDK 11+)
- Android SDK 경로 설정 확인
- Gradle 캐시 정리: `cd android && ./gradlew clean`

### iOS 빌드 실패
- Xcode 최신 버전 확인
- CocoaPods 업데이트: `pod repo update`
- 프로비저닝 프로파일 확인

---

## 📞 지원

- 이슈 트래커: GitHub Issues
- 문서: README.md
- 대화 로그: conversation_log_*.md

**빌드 날짜**: 2025-11-10
**버전**: 1.0.0
