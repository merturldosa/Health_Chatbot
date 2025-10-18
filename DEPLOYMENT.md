# AI 건강 상담 챗봇 배포 가이드

## 📋 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [Git 저장소 설정 및 GitHub에 올리기](#git-저장소-설정-및-github에-올리기)
3. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
4. [프로덕션 배포](#프로덕션-배포)
5. [환경 변수 설정](#환경-변수-설정)
6. [데이터베이스 설정](#데이터베이스-설정)
7. [보안 고려사항](#보안-고려사항)
8. [트러블슈팅](#트러블슈팅)

---

## 시스템 요구사항

### 백엔드
- Python 3.9 이상
- pip (Python 패키지 관리자)
- 가상환경 도구 (venv 또는 virtualenv)

### 프론트엔드
- Node.js 16 이상
- npm 또는 yarn

### 데이터베이스
- **개발**: SQLite (기본 설정)
- **프로덕션**: PostgreSQL 권장

### Git
- Git 2.0 이상
- GitHub 계정

---

## Git 저장소 설정 및 GitHub에 올리기

### 1. Git 초기 설정 (처음 한 번만)

```bash
# Git 사용자 정보 설정
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 기본 브랜치 이름 설정 (선택사항)
git config --global init.defaultBranch main
```

### 2. 로컬 Git 저장소 초기화

프로젝트 루트 디렉토리에서:

```bash
# 프로젝트 루트로 이동
cd D:\prj\campus\GJ-ICT\lp

# Git 저장소 초기화
git init

# .gitignore 파일 확인
# 이미 생성되어 있어야 함 (루트, backend, frontend 각각)
ls -la .gitignore
ls -la backend/.gitignore
ls -la frontend/.gitignore
```

### 3. GitHub 저장소 생성

#### 3.1 GitHub 웹사이트에서

1. **GitHub 로그인**: https://github.com
2. **New repository** 클릭 (오른쪽 상단 '+' 버튼)
3. **저장소 설정**:
   - Repository name: `health-chatbot` (또는 원하는 이름)
   - Description: `AI 건강 상담 챗봇 애플리케이션`
   - Visibility:
     - **Public**: 누구나 볼 수 있음
     - **Private**: 본인과 협업자만 볼 수 있음 (권장)
   - ⚠️ **중요**:
     - ❌ **Initialize this repository with a README** 체크 해제
     - ❌ **.gitignore** 선택 안 함
     - ❌ **License** 선택 안 함
4. **Create repository** 클릭

### 4. 민감 정보 확인 (중요! ⚠️)

**커밋 전 반드시 확인**:

```bash
# .env 파일이 .gitignore에 포함되어 있는지 확인
cat .gitignore | grep .env
cat backend/.gitignore | grep .env
cat frontend/.gitignore | grep .env

# 데이터베이스 파일이 제외되는지 확인
cat backend/.gitignore | grep "*.db"

# 가상환경이 제외되는지 확인
cat backend/.gitignore | grep venv
cat frontend/.gitignore | grep node_modules
```

**만약 .env 파일이 포함되어 있지 않다면**:

```bash
# 각 .gitignore 파일에 추가
echo ".env" >> .gitignore
echo ".env" >> backend/.gitignore
echo ".env" >> frontend/.gitignore
```

### 5. 파일 추가 및 첫 커밋

```bash
# 현재 상태 확인
git status

# 모든 파일 스테이징
git add .

# 스테이징된 파일 확인
git status

# 첫 커밋 생성
git commit -m "Initial commit: AI 건강 상담 챗봇 프로젝트"
```

**커밋 메시지 작성 가이드**:
- `Initial commit`: 프로젝트 초기 설정
- `Add feature`: 새로운 기능 추가
- `Fix bug`: 버그 수정
- `Update docs`: 문서 업데이트
- `Refactor`: 코드 리팩토링

### 6. GitHub 원격 저장소 연결

```bash
# 원격 저장소 추가 (GitHub에서 제공하는 URL 사용)
git remote add origin https://github.com/your-username/health-chatbot.git

# 원격 저장소 확인
git remote -v
```

### 7. GitHub에 푸시

```bash
# main 브랜치로 푸시
git push -u origin main
```

**인증 방법**:

#### 방법 1: Personal Access Token (권장)

1. **GitHub 토큰 생성**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token (classic)" 클릭
   - Note: `health-chatbot-deploy`
   - Expiration: `90 days` 또는 원하는 기간
   - Scopes: `repo` 전체 선택
   - "Generate token" 클릭
   - **토큰을 안전한 곳에 복사 저장** (다시 볼 수 없음!)

2. **푸시 시 인증**:
   ```bash
   git push -u origin main

   # Username: your-github-username
   # Password: <생성한-토큰-붙여넣기>
   ```

#### 방법 2: SSH 키 (선택사항)

```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your.email@example.com"

# 공개 키 복사
cat ~/.ssh/id_ed25519.pub

# GitHub에 SSH 키 등록
# GitHub → Settings → SSH and GPG keys → New SSH key
# 복사한 공개 키 붙여넣기

# 원격 저장소 URL을 SSH로 변경
git remote set-url origin git@github.com:your-username/health-chatbot.git

# 푸시
git push -u origin main
```

### 8. 푸시 성공 확인

```bash
# 푸시 성공 메시지 확인
# Enumerating objects: ..., done.
# Counting objects: ..., done.
# Writing objects: ..., done.
# To https://github.com/your-username/health-chatbot.git
#  * [new branch]      main -> main
```

**GitHub 웹에서 확인**:
- https://github.com/your-username/health-chatbot
- 파일들이 모두 업로드되었는지 확인

### 9. 이후 변경사항 푸시

```bash
# 변경된 파일 확인
git status

# 변경된 파일 스테이징
git add .

# 또는 특정 파일만 추가
git add backend/app/main.py
git add frontend/src/App.jsx

# 커밋
git commit -m "Add: 건강 기록 저장 기능 추가"

# 푸시
git push
```

### 10. 브랜치 전략 (선택사항)

#### 기본 워크플로우

```bash
# 새 기능 개발용 브랜치 생성
git checkout -b feature/chat-improvement

# 작업 후 커밋
git add .
git commit -m "Improve: 채팅 응답 품질 개선"

# GitHub에 푸시
git push -u origin feature/chat-improvement

# GitHub에서 Pull Request 생성
# main 브랜치로 병합 후

# 로컬에서 main 브랜치로 전환 및 업데이트
git checkout main
git pull origin main

# 병합된 브랜치 삭제
git branch -d feature/chat-improvement
```

### 11. 협업자 추가 (선택사항)

GitHub 저장소에서:
1. **Settings** → **Collaborators**
2. **Add people** 클릭
3. 협업자 GitHub 아이디 입력
4. 권한 설정 (Write 또는 Admin)

### 12. .gitignore 파일 내용

#### 루트 .gitignore

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Database files (개발용만)
*.db
*.sqlite
*.sqlite3
```

#### backend/.gitignore

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
venv/
env/

# Environment
.env
.venv

# Database
*.db
*.sqlite
*.sqlite3

# IDE
.vscode/
.idea/
```

#### frontend/.gitignore

```gitignore
# Dependencies
node_modules/

# Build
dist/
dist-ssr/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

### 13. 일반적인 Git 명령어

```bash
# 현재 상태 확인
git status

# 변경 내역 확인
git diff

# 커밋 히스토리 확인
git log
git log --oneline --graph

# 최신 변경사항 가져오기
git pull

# 특정 파일 되돌리기 (변경사항 취소)
git checkout -- filename

# 마지막 커밋 수정
git commit --amend -m "새로운 커밋 메시지"

# 원격 저장소와 동기화
git fetch origin
git merge origin/main
```

### 14. 실수 복구

#### .env 파일을 실수로 커밋한 경우

```bash
# Git 히스토리에서 파일 제거 (주의!)
git rm --cached backend/.env
git rm --cached frontend/.env

# .gitignore에 추가 확인
echo ".env" >> backend/.gitignore
echo ".env" >> frontend/.gitignore

# 커밋
git commit -m "Remove .env files from tracking"

# 푸시 (주의: 이미 푸시된 경우 비밀 정보가 노출됨)
git push

# 보안 조치: 노출된 SECRET_KEY, 비밀번호 등은 즉시 변경!
```

#### 잘못된 커밋 되돌리기

```bash
# 마지막 커밋 취소 (변경사항은 유지)
git reset --soft HEAD~1

# 마지막 커밋 완전히 취소 (변경사항도 삭제, 주의!)
git reset --hard HEAD~1

# 푸시 전 상태로 되돌리기
git reset --hard origin/main
```

### 15. GitHub 저장소 보안 체크리스트

배포 전 반드시 확인:

- [ ] `.env` 파일이 Git에 포함되지 않음
- [ ] `SECRET_KEY`가 노출되지 않음
- [ ] 데이터베이스 파일(`.db`, `.sqlite`)이 제외됨
- [ ] `node_modules/` 폴더가 제외됨
- [ ] `venv/` 폴더가 제외됨
- [ ] API 키, 비밀번호가 코드에 하드코딩되지 않음
- [ ] Private 저장소로 설정 (민감한 프로젝트의 경우)

---

## 로컬 개발 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd lp
```

### 2. 백엔드 설정

#### 2.1 가상환경 생성 및 활성화

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 패키지 설치

```bash
pip install -r requirements.txt
```

#### 2.3 환경 변수 설정

`backend/.env` 파일 생성:

```env
# Mock AI Service (No API key needed)
# Using test responses without external API calls

# Database
DATABASE_URL=sqlite+aiosqlite:///./health_chatbot.db

# Security
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App Settings
APP_NAME=AI Health Chatbot
DEBUG=True
```

**중요**: `SECRET_KEY`는 반드시 변경하세요!

```bash
# SECRET_KEY 생성 방법
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 2.4 데이터베이스 초기화

```bash
# 백엔드 서버 실행 시 자동으로 테이블 생성됨
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버 실행 확인: http://localhost:8000/docs

### 3. 프론트엔드 설정

#### 3.1 패키지 설치

```bash
cd ../frontend
npm install
```

#### 3.2 환경 변수 설정

`frontend/.env` 파일 생성:

```env
VITE_API_URL=http://localhost:8000
```

#### 3.3 개발 서버 실행

```bash
npm run dev
```

프론트엔드 접속: http://localhost:5173

---

## 프로덕션 배포

### 방법 1: 클라우드 플랫폼 배포 (권장)

#### 백엔드 배포 (Render / Railway)

**Render 사용:**

1. **Render 계정 생성**: https://render.com

2. **New Web Service 생성**
   - Repository 연결
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **환경 변수 설정**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   SECRET_KEY=<생성한-시크릿-키>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEBUG=False
   ```

4. **PostgreSQL 데이터베이스 추가**
   - Render Dashboard에서 "New PostgreSQL" 생성
   - 연결 정보를 `DATABASE_URL`에 설정

**Railway 사용:**

1. **Railway 계정 생성**: https://railway.app

2. **New Project** → **Deploy from GitHub repo**

3. **Backend 서비스 설정**
   - Root Directory: `backend`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **PostgreSQL 플러그인 추가**
   - "New" → "Database" → "PostgreSQL"
   - 자동으로 `DATABASE_URL` 환경 변수 생성됨

5. **환경 변수 추가**
   ```
   SECRET_KEY=<생성한-시크릿-키>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DEBUG=False
   ```

#### 프론트엔드 배포 (Vercel / Netlify)

**Vercel 사용:**

1. **Vercel 계정 생성**: https://vercel.com

2. **New Project** → Repository 선택

3. **프로젝트 설정**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **환경 변수 설정**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

5. **Deploy** 클릭

**Netlify 사용:**

1. **Netlify 계정 생성**: https://netlify.com

2. **New site from Git** → Repository 선택

3. **빌드 설정**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **환경 변수**
   - Site settings → Build & deploy → Environment
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

### 방법 2: VPS 배포 (Ubuntu)

#### 서버 준비

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Python 설치
sudo apt install python3 python3-pip python3-venv -y

# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Nginx 설치
sudo apt install nginx -y

# PostgreSQL 설치
sudo apt install postgresql postgresql-contrib -y
```

#### 백엔드 배포

```bash
# 프로젝트 클론
cd /var/www
sudo git clone <repository-url> health-chatbot
cd health-chatbot/backend

# 가상환경 생성
sudo python3 -m venv venv
sudo venv/bin/pip install -r requirements.txt

# .env 파일 설정
sudo nano .env
```

**Systemd 서비스 생성** (`/etc/systemd/system/health-chatbot.service`):

```ini
[Unit]
Description=Health Chatbot Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/health-chatbot/backend
Environment="PATH=/var/www/health-chatbot/backend/venv/bin"
ExecStart=/var/www/health-chatbot/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl start health-chatbot
sudo systemctl enable health-chatbot
```

#### 프론트엔드 빌드

```bash
cd /var/www/health-chatbot/frontend

# 환경 변수 설정
echo "VITE_API_URL=https://yourdomain.com/api" > .env

# 빌드
npm install
npm run build
```

#### Nginx 설정

`/etc/nginx/sites-available/health-chatbot`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 프론트엔드
    location / {
        root /var/www/health-chatbot/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Nginx 설정 활성화
sudo ln -s /etc/nginx/sites-available/health-chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL 인증서 설정 (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## 환경 변수 설정

### 백엔드 환경 변수

| 변수명 | 설명 | 개발 | 프로덕션 |
|--------|------|------|----------|
| `DATABASE_URL` | 데이터베이스 연결 URL | `sqlite+aiosqlite:///./health_chatbot.db` | `postgresql://...` |
| `SECRET_KEY` | JWT 암호화 키 | 테스트용 | **반드시 변경** |
| `ALGORITHM` | JWT 알고리즘 | `HS256` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 토큰 만료 시간 | `30` | `30` |
| `DEBUG` | 디버그 모드 | `True` | `False` |

### 프론트엔드 환경 변수

| 변수명 | 설명 | 개발 | 프로덕션 |
|--------|------|------|----------|
| `VITE_API_URL` | 백엔드 API URL | `http://localhost:8000` | `https://api.yourdomain.com` |

---

## 데이터베이스 설정

### SQLite (개발 환경)

- 기본 설정으로 자동 생성됨
- `health_chatbot.db` 파일로 저장
- 별도 설정 불필요

### PostgreSQL (프로덕션 권장)

#### 1. PostgreSQL 설치 및 데이터베이스 생성

```bash
# PostgreSQL 접속
sudo -u postgres psql

# 데이터베이스 생성
CREATE DATABASE health_chatbot;

# 사용자 생성 및 권한 부여
CREATE USER chatbot_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE health_chatbot TO chatbot_user;
\q
```

#### 2. DATABASE_URL 설정

```env
DATABASE_URL=postgresql+asyncpg://chatbot_user:your-password@localhost:5432/health_chatbot
```

**주의**: asyncpg 드라이버 설치 필요

```bash
pip install asyncpg
```

#### 3. requirements.txt에 추가

```txt
asyncpg==0.29.0
```

---

## 보안 고려사항

### 1. SECRET_KEY 보안

```bash
# 강력한 SECRET_KEY 생성
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

- 절대 버전 관리 시스템에 커밋하지 말 것
- 환경 변수나 시크릿 관리 도구 사용

### 2. CORS 설정

프로덕션에서는 `backend/app/main.py`의 CORS 설정 수정:

```python
origins = [
    "https://yourdomain.com",  # 프로덕션 도메인만 허용
]
```

### 3. HTTPS 사용

- 프로덕션에서는 반드시 HTTPS 사용
- Let's Encrypt로 무료 SSL 인증서 발급

### 4. 비밀번호 정책

- 최소 8자 이상
- 영문, 숫자, 특수문자 조합 권장

### 5. Rate Limiting

향후 추가 권장:
```bash
pip install slowapi
```

### 6. 데이터베이스 백업

```bash
# PostgreSQL 백업
pg_dump health_chatbot > backup.sql

# 복구
psql health_chatbot < backup.sql
```

---

## 트러블슈팅

### 백엔드 이슈

#### 1. 모듈 import 에러

```bash
# 가상환경이 활성화되어 있는지 확인
which python  # venv 경로가 나와야 함

# 패키지 재설치
pip install -r requirements.txt
```

#### 2. 데이터베이스 연결 실패

```bash
# SQLite: 경로 권한 확인
ls -l health_chatbot.db

# PostgreSQL: 연결 테스트
psql -U chatbot_user -d health_chatbot -h localhost
```

#### 3. 포트 이미 사용 중

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:8000 | xargs kill -9
```

### 프론트엔드 이슈

#### 1. API 연결 실패

- `VITE_API_URL` 환경 변수 확인
- 브라우저 콘솔(F12)에서 네트워크 요청 확인
- CORS 에러 확인

#### 2. 빌드 에러

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 3. 환경 변수 적용 안 됨

- Vite는 빌드 시 환경 변수를 포함
- 환경 변수 변경 후 반드시 재빌드 필요

```bash
npm run build
```

### 일반적인 문제

#### CORS 에러

백엔드 `main.py`에서 프론트엔드 URL 추가:

```python
origins = [
    "http://localhost:5173",
    "https://yourdomain.com",
]
```

#### 인증 토큰 만료

- 로그인 다시 수행
- `ACCESS_TOKEN_EXPIRE_MINUTES` 값 조정

---

## 성능 최적화

### 백엔드

1. **Gunicorn 사용** (프로덕션)

```bash
pip install gunicorn

# 실행
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

2. **데이터베이스 인덱스**

주요 쿼리 컬럼에 인덱스 추가

### 프론트엔드

1. **빌드 최적화**

```bash
npm run build
```

2. **CDN 사용**

정적 파일을 CDN에 호스팅

3. **이미지 최적화**

WebP 형식 사용, 이미지 압축

---

## 모니터링 및 로깅

### 로그 확인

```bash
# Systemd 서비스 로그
sudo journalctl -u health-chatbot -f

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 모니터링 도구

- **Sentry**: 에러 트래킹
- **New Relic**: 성능 모니터링
- **Uptime Robot**: 서버 가동 시간 모니터링

---

## 체크리스트

### 배포 전 확인사항

- [ ] SECRET_KEY 변경
- [ ] DEBUG=False 설정
- [ ] CORS 설정 프로덕션 도메인만 허용
- [ ] 데이터베이스 백업 설정
- [ ] HTTPS 인증서 설정
- [ ] 환경 변수 모두 설정
- [ ] 로그 모니터링 설정
- [ ] 에러 추적 도구 설정

### 배포 후 테스트

- [ ] 회원가입/로그인 테스트
- [ ] 건강 기록 저장 테스트
- [ ] 채팅 기능 테스트
- [ ] 모바일 반응형 확인
- [ ] 다양한 브라우저 테스트

---

## 지원 및 문의

- 이슈 트래킹: GitHub Issues
- 문서: 프로젝트 README.md

---

## 라이선스

이 프로젝트의 라이선스 정보는 LICENSE 파일을 참조하세요.

---

**배포 성공을 기원합니다! 🚀**
