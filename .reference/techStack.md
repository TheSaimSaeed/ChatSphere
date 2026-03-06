# 🛠 ChatSphere — Tech Stack (MVP)

> All tools selected are **free / open-source** with no paid service required.

---

## 🖥 Frontend

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Fullstack framework — handles both UI and API |
| Language | **TypeScript** | Type safety across the codebase |
| Styling | **TailwindCSS** | Utility-first CSS, free & open-source |
| State Management | **Redux Toolkit** | Manages chat state, auth, presence |
| Real-time Client | **Socket.io Client** | WebSocket abstraction |
| Form Handling | **React Hook Form** | Lightweight, no extra cost |
| Validation | **Zod** | Schema validation (shared with backend) |
| Icons | **Lucide React** | Free open-source icon set |
| Notifications | **Web Push API (native)** | Browser-native, no 3rd-party service needed |

---

## ⚙️ Backend

| Layer | Technology | Notes |
|---|---|---|
| Runtime | **Node.js** | Bundled with Next.js |
| API | **Next.js API Routes** | REST endpoints inside the same project |
| Real-time Server | **Socket.io** | WebSocket server for messaging, presence, typing |
| Authentication | **JWT (jsonwebtoken)** | Stateless auth — no paid auth provider |
| Password Hashing | **bcryptjs** | Secure password storage |
| Input Validation | **Zod** | Validates all API inputs |
| Middleware | **Custom Next.js Middleware** | JWT verification on protected routes |
| Rate Limiting | **upstash/ratelimit (free tier)** or **custom in-memory limiter** | Prevent API abuse |

---

## 🗄 Database

| Layer | Technology | Notes |
|---|---|---|
| Primary Database | **MongoDB** | Document store for messages, users, chats |
| ODM | **Mongoose** | Schema modeling for MongoDB |
| Hosting | **MongoDB Atlas (Free Tier)** | 512MB free — sufficient for MVP |
| Indexing | `chatId`, `senderId`, `createdAt` | For fast message queries |

---

## 📁 File / Media Storage

| Layer | Technology | Notes |
|---|---|---|
| File Storage | **Cloudinary (Free Tier)** | 25GB storage + 25GB bandwidth/month free |
| Upload Handling | **Next.js API Route + formidable** | Parse multipart form data server-side |
| File Types | Images, Videos, PDFs | Preview before send |

> **No paid CDN required** — Cloudinary's free tier covers MVP needs.

---

## 🔴 Caching & Presence

| Layer | Technology | Notes |
|---|---|---|
| Presence / Online Status | **In-memory via Socket.io** | Track connected sockets server-side |
| Caching | **In-process Map / Socket.io rooms** | Sufficient for MVP scale |

> Redis is listed in the PRD for Phase 2+ scaling. For MVP, Socket.io's built-in room and in-memory management handles presence without Redis.

---

## 🔐 Security

| Concern | Solution |
|---|---|
| Auth | JWT (HTTP-only cookies recommended) |
| Password | bcryptjs (salt rounds: 10+) |
| Input | Zod validation on all inputs |
| XSS | Next.js escapes output by default |
| CSRF | SameSite cookies + CORS config |
| CORS | `next.config.js` CORS headers |
| File Upload | MIME type + size validation before Cloudinary upload |
| HTTPS | Enforced via Vercel deployment |

---

## 🚀 Deployment & DevOps

| Layer | Technology | Notes |
|---|---|---|
| Hosting | **Vercel (Free Hobby Tier)** | Deploys Next.js natively, free for personal projects |
| Database | **MongoDB Atlas (Free Tier)** | M0 cluster — free forever |
| Media | **Cloudinary (Free Tier)** | No credit card needed for free tier |
| CI/CD | **GitHub Actions** | Free for public repos / 2,000 min/month for private |
| Environment Variables | **Vercel Dashboard** | Secure env var management built-in |
| Monitoring | **Vercel Analytics (Free)** | Basic analytics included in hobby plan |

---

## 📦 Key NPM Packages

```bash
# Core
next, react, react-dom, typescript

# Styling
tailwindcss, postcss, autoprefixer, lucide-react

# State
@reduxjs/toolkit, react-redux

# Forms & Validation
react-hook-form, zod

# Auth
jsonwebtoken, bcryptjs

# Database
mongoose

# Real-time
socket.io, socket.io-client

# File Upload
formidable, cloudinary

# Utilities
date-fns, uuid, cookie
```

---

## 🗺 Summary Architecture

```
Browser (Next.js Client)
    │
    ├── REST API calls ──────► Next.js API Routes ──► MongoDB Atlas
    │
    └── WebSocket ───────────► Socket.io Server ────► Broadcasts to clients
                                      │
                              In-memory presence map
```

---

## ✅ Why This Stack Works for Free MVP

- **Vercel Hobby** — free Next.js hosting with serverless functions
- **MongoDB Atlas M0** — free 512MB cluster, enough for thousands of messages
- **Cloudinary Free** — 25GB storage covers media for MVP
- **Socket.io** — self-hosted real-time, no third-party real-time service needed
- **JWT + bcrypt** — no Auth0/Clerk/Firebase required

---

*Generated for ChatSphere MVP · Next.js + MongoDB · No paid services required*
