# 인생게임 (LifeMaker)

해커톤 하루 MVP를 목표로 만든 풀스택 웹앱입니다. 현실 목표를 RPG 퀘스트로 바꾸고, 경험치와 코인, 아바타, 방 꾸미기, 광장 채팅으로 동기부여를 높입니다.

## 시스템 아키텍처

```text
Frontend (React + Vite + Tailwind)
  -> REST API (Spring Boot)
  -> WebSocket STOMP Chat
Backend (Spring Boot)
  -> MongoDB Atlas / Local MongoDB
  -> OpenAI Responses API
  -> Google OAuth ID Token Verification
Deploy
  Frontend -> Vercel
  Backend -> AWS EC2
  Database -> MongoDB Atlas
```

## 프로젝트 구조

```text
lifemakerdemo/
  frontend/   React + TypeScript + Vite + Tailwind UI
  backend/    Spring Boot REST API + JWT + MongoDB + WebSocket
  README.md
```

## 주요 기능

- 이메일/비밀번호 회원가입, 로그인, JWT 인증
- Google OAuth 로그인 엔드포인트
- AI 퀘스트 생성 API `POST /api/ai/generateQuest`
- 퀘스트 생성, 조회, 완료와 레벨업 보상
- 아바타, 프로필, 마이룸, 상점 데이터 모델
- 광장 실시간 WebSocket 채팅
- 모바일/태블릿/데스크톱 대응 UI

## MongoDB 모델

### User

```json
{
  "id": "string",
  "email": "string",
  "nickname": "string",
  "password": "string",
  "provider": "LOCAL | GOOGLE",
  "level": 1,
  "exp": 0,
  "coins": 200,
  "avatar": {
    "hair": "Starter Cut",
    "clothes": "Novice Hoodie",
    "accessories": ["Beginner Badge"],
    "colors": {
      "skin": "#F1C27D",
      "hair": "#22C55E",
      "clothes": "#38BDF8"
    }
  },
  "stats": {
    "focus": 40,
    "knowledge": 35,
    "health": 30,
    "social": 25,
    "discipline": 38
  }
}
```

### Quest

```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "description": "string",
  "rewardExp": 80,
  "rewardCoin": 120,
  "status": "in-progress | completed",
  "progress": 0
}
```

### ShopItem

```json
{
  "itemId": "string",
  "name": "string",
  "type": "hair | clothes | accessories | room_furniture",
  "price": 280,
  "image": "PX"
}
```

## 로컬 실행

### 1. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

### 2. Backend

```bash
cd backend
copy .env.example .env
mvn spring-boot:run
```

환경변수는 PowerShell에서 직접 주입해도 됩니다.

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/lifemaker"
$env:JWT_SECRET="replace-with-strong-secret"
$env:OPENAI_API_KEY="sk-..."
$env:GOOGLE_CLIENT_ID="..."
$env:GOOGLE_CLIENT_SECRET="..."
mvn spring-boot:run
```

## 핵심 API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/users/me`
- `GET /api/quests`
- `POST /api/quests`
- `POST /api/quests/{questId}/complete`
- `POST /api/ai/generateQuest`
- `GET /api/shop/items`
- `GET /api/rooms/me`
- WebSocket endpoint: `/ws-chat`

## 배포 메모

- 프론트엔드는 Vercel에 `frontend` 폴더 기준 배포
- 백엔드는 EC2에서 Java 17, Maven, 환경변수 세팅 후 실행
- MongoDB Atlas URI를 `MONGODB_URI`에 연결
- OpenAI 키가 없으면 AI 퀘스트는 안전한 fallback 로직으로 동작
