# LifeMaker MVP

현실의 나를 투영한 캐릭터를 키우면서 목표를 퀘스트로 달성하는 로컬 MVP입니다.

## 현재 구현 범위

- 이메일 회원가입 / 로그인
- JWT 기반 세션 유지
- 아바타 생성 및 커스터마이즈
- 목표 + 현재 상황 입력
- AI 또는 fallback 로직 기반 목표 분석
- 분석 결과에 따른 퀘스트 3개 생성
- 퀘스트 완료 시 EXP / 코인 보상과 레벨업
- 대시보드, 퀘스트 로그, 프로필, 상점 UI

## 기술 스택

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: Spring Boot 3 + JWT
- Storage: MongoDB

## 로컬 실행

### 1. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 2. Backend + MongoDB

```bash
cp .env.example .env
docker compose up -d --build
```

Compose는 루트의 `.env`를 읽어 MongoDB와 Spring Boot에 변수를 주입합니다.
OpenAI 키가 없어도 앱은 동작합니다. 이 경우 백엔드는 휴리스틱 기반으로 목표를 분석하고 퀘스트를 생성합니다.

### 3. 종료

```bash
docker compose down
```

## 배포 메모

### Frontend

- `frontend`는 Vercel preview 배포 기준으로 동작합니다.
- React Router 직접 접근을 위해 [frontend/vercel.json](/Users/jinhyuk/krafton/lifemaker/frontend/vercel.json) 이 포함되어 있습니다.
- 운영 배포에서는 `VITE_API_URL`을 백엔드 HTTPS 주소 또는 프록시 경로로 맞춰야 합니다.

### Backend

- [backend/Dockerfile](/Users/jinhyuk/krafton/lifemaker/backend/Dockerfile) 로 이미지 빌드
- 루트 [.env.example](/Users/jinhyuk/krafton/lifemaker/.env.example) 를 복사한 `.env`를 기준으로 [docker-compose.yml](/Users/jinhyuk/krafton/lifemaker/docker-compose.yml) 이 MongoDB + Spring Boot를 함께 실행
- [.github/workflows/deploy-backend.yml](/Users/jinhyuk/krafton/lifemaker/.github/workflows/deploy-backend.yml) 이 GitHub Actions 배포 워크플로
- GitHub Actions도 EC2에 동일한 `.env` 파일을 생성해서 compose를 실행

GitHub Secrets:

- `EC2_HOST`
- `EC2_USERNAME`
- `EC2_SSH_KEY`
- `MONGO_ROOT_USERNAME`
- `MONGO_ROOT_PASSWORD`
- `JWT_SECRET`
- `OPENAI_API_KEY` (선택)

GitHub Variables:

- `APP_PORT`
- `MONGO_DATABASE`
- `OPENAI_MODEL`
- `APP_CORS_ALLOWED_ORIGIN_PATTERNS`

운영 단계에서는 EC2 백엔드에 HTTPS를 붙이거나, Vercel 측 프록시를 두는 것이 필요합니다.

## 주요 API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PUT /api/users/avatar`
- `GET /api/quests`
- `POST /api/quests/{questId}/complete`
- `POST /api/ai/generate-plan`

## 테스트 시나리오

1. `/signup`에서 계정을 만듭니다.
2. `/avatar`에서 캐릭터 외형을 저장합니다.
3. `/ai-quests`에서 목표와 현재 상황을 입력합니다.
4. 생성된 퀘스트가 `/quests`와 대시보드에 반영되는지 확인합니다.
5. 퀘스트를 완료해 코인, EXP, 레벨이 오르는지 확인합니다.
