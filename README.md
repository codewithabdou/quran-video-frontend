# Quran Video Generator — Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn/UI](https://img.shields.io/badge/Shadcn%2FUI-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

A modern React application for creating Quran video reels with synchronized audio, translations, and dynamic backgrounds. Features Google OAuth authentication, generation history, an admin dashboard, and push notifications.

## Features

- **Video Generation**: Create vertical (9:16) reels or horizontal (16:9) YouTube videos.
- **Google OAuth**: Sign in with Google. First user auto-promoted to ADMIN.
- **Generation History**: View past generations with status, surah name, and metadata (`/history`).
- **Admin Dashboard**: System stats, user management, and queue control (`/admin`).
- **Push Notifications**: Browser notifications when your video finishes rendering.
- **Dynamic Backgrounds**: Search and select Pexels video backgrounds with server-side caching.
- **Multi-Language**: English, French, and Arabic interface with RTL support.
- **Dark/Light Mode**: Theme switching with smooth transitions.
- **Native Sharing**: Web Share API for direct MP4 sharing to social apps.
- **Queue Feedback**: Real-time progress with exact queue position via SSE.

## Quick Start

### Prerequisites

- Node.js v18+
- Backend running (see [backend README](../quran-video-backend-node/README.md))

### Installation

```bash
cd quran-video-frontend
npm install
```

### Configuration

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_NODE_API_URL` | Backend URL (default: `http://localhost:5000`) |
| `VITE_VAPID_PUBLIC_KEY` | Push notification key (must match backend) |

### Run

```bash
npm run dev
```

Visit `http://localhost:5173`.

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/generate` | 🔒 Auth | Video generator with real-time progress |
| `/history` | 🔒 Auth | Paginated generation history |
| `/admin` | 🔒👑 Admin | Stats, user management, queue control |
| `/auth/callback` | Internal | Google OAuth token handler |

## Usage

1. **Sign In**: Click "Sign in with Google" (first user becomes ADMIN).
2. **Select Surah**: Choose from 114 surahs, set ayah range.
3. **Choose Layout**: Reel (9:16) or YouTube (16:9).
4. **Pick Background**: Search Pexels or use the default.
5. **Generate**: Click "Generate Video" — watch real-time progress.
6. **Download/Share**: Preview, download, or share directly to social apps.

## Tech Stack

- **Framework**: React 18 + Vite
- **UI**: Shadcn/UI + Tailwind CSS
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **State**: React Context (Auth, Theme/Language)
- **HTTP**: Axios with JWT interceptor
- **Notifications**: Web Push API + Service Worker

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.