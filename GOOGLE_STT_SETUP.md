# Google Cloud Speech-to-Text 설정 가이드

## 🎯 개요

애고(ego) 앱의 음성 입력 기능을 사용하려면 Google Cloud Speech-to-Text API가 필요합니다.

## 📋 설정 단계

### 1. Google Cloud 프로젝트 생성 (이미 있다면 스킵)

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택

### 2. Speech-to-Text API 활성화

1. [Speech-to-Text API](https://console.cloud.google.com/apis/library/speech.googleapis.com) 페이지로 이동
2. **"사용 설정"** 클릭

### 3. 서비스 계정 생성 및 키 다운로드

1. [서비스 계정 페이지](https://console.cloud.google.com/iam-admin/serviceaccounts) 이동
2. **"서비스 계정 만들기"** 클릭
3. 서비스 계정 이름 입력 (예: `ego-stt-service`)
4. **"만들기 및 계속"** 클릭
5. 역할 선택:
   - `Cloud Speech 관리자` 또는
   - `Cloud Speech 클라이언트`
6. **"계속"** → **"완료"** 클릭
7. 생성된 서비스 계정 클릭
8. **"키"** 탭 → **"키 추가"** → **"새 키 만들기"**
9. 키 유형: **JSON** 선택
10. JSON 키 파일 다운로드됨 (절대 공유하지 말 것!)

### 4. 환경변수 설정

#### 방법 1: 환경변수로 경로 설정 (권장)

**Windows (PowerShell)**:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account-key.json"
```

**Windows (영구 설정)**:
```powershell
[System.Environment]::SetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', 'C:\path\to\service-account-key.json', 'User')
```

**Linux/Mac**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

#### 방법 2: .env 파일에 추가

`backend/.env` 파일에 다음 추가:
```env
GOOGLE_APPLICATION_CREDENTIALS=D:\prj\campus\GJ-ICT\lp\backend\google-stt-key.json
```

키 파일을 `backend/` 폴더에 저장 (절대 Git에 커밋하지 말 것!)

### 5. .gitignore 업데이트

`backend/.gitignore`에 다음 추가:
```
# Google Cloud 키 (절대 커밋하지 말 것!)
google-stt-key.json
*-key.json
credentials.json
```

## 🔍 인증 확인

백엔드 서버 시작 시 다음 메시지 확인:

✅ **성공**: `Google Cloud STT: 서비스 계정 인증 (경로)`
⚠️ **실패**: `Google Cloud STT 초기화 실패` + 해결방법 안내

## 💡 대안: gcloud CLI 인증

서비스 계정 JSON 없이 사용하려면:

```bash
# gcloud CLI 설치 후
gcloud auth application-default login
```

이후 ADC (Application Default Credentials)로 자동 인증됨.

## 🎙️ 테스트

API 테스트용 엔드포인트:
- **POST** `/api/speech/transcribe` - Base64 오디오
- **POST** `/api/speech/transcribe-file` - 파일 업로드

Swagger UI: http://localhost:8000/docs

## 💰 요금

- Google Cloud Speech-to-Text는 **유료 서비스**입니다.
- 무료 할당량: 월 60분 (처음 60분은 무료)
- 초과 시: $0.006/15초 (약 분당 $0.024)

[가격 정보](https://cloud.google.com/speech-to-text/pricing)

## 🔐 보안 주의사항

1. ⚠️ **절대로** JSON 키 파일을 Git에 커밋하지 마세요
2. ⚠️ **절대로** 키 파일을 다른 사람과 공유하지 마세요
3. ✅ 키 파일은 안전한 위치에 저장
4. ✅ 프로덕션 환경에서는 환경변수 또는 secret manager 사용

## 📚 참고 자료

- [Google Cloud Speech-to-Text 문서](https://cloud.google.com/speech-to-text/docs)
- [Python 클라이언트 라이브러리](https://cloud.google.com/python/docs/reference/speech/latest)
- [인증 가이드](https://cloud.google.com/docs/authentication/getting-started)
