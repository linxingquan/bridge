# Bridge

A geolocation-based dating app built with React Native (Expo) and Express/MongoDB. Users create profiles, discover nearby people through swiping, match mutually, and chat in real time.

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React Native 0.81, Expo 54, TypeScript          |
| Backend  | Express 5, TypeScript, MongoDB/Mongoose          |
| Realtime | Socket.io                                        |
| Auth     | JWT + bcryptjs                                   |

## Getting Started

### Prerequisites

- Node.js
- MongoDB running locally
- iOS: Xcode + CocoaPods / Android: Android SDK

### Backend

```bash
cd bridge-backend
npm install
cp .env.example .env   # configure your environment variables
npm run dev             # starts dev server with hot-reload on port 3000
```

### Frontend

```bash
cd bridge-app
npm install
npm start               # launches Expo dev server
```

Then press `i` for iOS simulator or `a` for Android emulator.

## Environment Variables

### Backend (`bridge-backend/.env`)

```
API_PORT=3000
API_HOST=192.168.1.246
MONGODB_URI=mongodb://localhost:27017/bridge
JWT_SECRET=your-secret-key
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
FRONTEND_URL=bridgeapp://
```

### Frontend (`bridge-app/.env.local`)

```
EXPO_PUBLIC_API_HOST=192.168.1.246
EXPO_PUBLIC_API_PORT=3000
```

## Project Structure

```
bridge/
├── bridge-app/src/
│   ├── screens/          # 17 screen components
│   ├── components/       # Reusable UI (Button, Input, SwipeCard, ChatBubble)
│   ├── navigation/       # Auth and main tab navigators
│   ├── context/          # AuthContext for global auth state
│   ├── services/         # API client (Axios), notifications
│   ├── theme/            # Colors, typography, spacing
│   └── types/            # TypeScript interfaces
│
├── bridge-backend/src/
│   ├── controllers/      # Route handlers (auth, user, discovery, chat, message)
│   ├── models/           # Mongoose schemas (User, Chat, Message, Swipe)
│   ├── routes/           # Express route definitions
│   ├── middleware/        # JWT auth middleware
│   └── services/         # Business logic utilities
│
└── SPEC.md               # Full product specification
```

## Features

- **Auth & Onboarding** — Email/password registration, age verification (18+), 5-step profile setup
- **Profile** — Photos (up to 6), bio, interests, relationship goals, education, height
- **Discovery** — Swipe-based feed filtered by distance, age, gender, and relationship intent
- **Matching** — Mutual likes create matches; unmatch and block supported
- **Real-time Chat** — Socket.io messaging with typing indicators, read receipts, photo sharing, and reactions
- **Notifications** — Push notifications for new matches and messages

## API Endpoints

| Group     | Endpoints                                         |
| --------- | ------------------------------------------------- |
| Auth      | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users     | `PUT /users/profile`, `GET /users/profile/:id`, `POST /users/photos` |
| Discovery | `GET /discovery/feed`, `POST /discovery/swipe`, `PUT /discovery/filters` |
| Chats     | `GET /chats`, `POST /chats`, `DELETE /chats/:id`  |
| Messages  | `GET /messages/:chatId`, `POST /messages/:chatId` |
| Reports   | `POST /reports`, `POST /reports/block/:userId`     |

## Scripts

### Backend

| Script      | Command          | Description                     |
| ----------- | ---------------- | ------------------------------- |
| `dev`       | `npm run dev`    | Dev server with hot-reload      |
| `build`     | `npm run build`  | Compile TypeScript              |
| `start`     | `npm start`      | Run compiled production build   |
| `test`      | `npm test`       | Run Jest tests                  |

### Frontend

| Script      | Command          | Description                     |
| ----------- | ---------------- | ------------------------------- |
| `start`     | `npm start`      | Expo dev server                 |
| `ios`       | `npm run ios`    | Run on iOS simulator            |
| `android`   | `npm run android`| Run on Android emulator         |
| `web`       | `npm run web`    | Run in browser                  |
