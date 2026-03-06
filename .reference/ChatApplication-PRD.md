# 📄 Product Requirements Document (PRD)

## Product Name: ChatSphere (WhatsApp-like Web Chat Application)

**Tech Stack:** Next.js (Frontend + Backend), MongoDB

> **Identity Strategy:**
> - **Primary Identity:** Email (unique, required, used for auth and discovery)
> - **Optional Field:** Phone number (stored but not verified in MVP)
> - **Phase 2+:** Phone verification can be added when there is traction, a monetization model, or a need for real identity binding

---

# 1. 📌 Overview

ChatSphere is a real-time web-based chat application similar to WhatsApp, enabling users to send text messages, media files, and create group chats. Users are identified and authenticated by **email and password**. A phone number field is available but entirely optional and not verified in the MVP.

The application is built entirely using **Next.js** (App Router + API Routes) and **MongoDB** for persistent storage, with **Socket.io** for real-time communication.

The goal is to build a scalable, production-ready, real-time messaging system optimized for performance, security, and extensibility.

---

# 2. 🎯 Objectives

- Provide real-time 1-to-1 messaging
- Support group chats
- Media sharing (images, videos, files)
- Online/offline presence
- Message status (sent, delivered, read)
- Authentication & user management (email + password)
- Clean, responsive UI

---

# 3. 👥 Target Users

- Students
- Teams & small businesses
- Online communities
- General web users

---

# 4. 🧩 Core Features (MVP)

## 4.1 Authentication & User Management

### Identity Model

| Field | Role | MVP Behaviour |
|---|---|---|
| `email` | Primary identity | Required, unique, used for login and user discovery |
| `password` | Authentication secret | Required, bcrypt hashed, never returned to client |
| `phone` | Optional contact field | Stored as plain string if provided — not verified, not unique |

### Registration
- User provides: name, email, password
- Optionally provides phone number (no verification required)
- Password validated (min 8 characters) and bcrypt hashed before storage
- JWT issued on successful registration, set as HTTP-only cookie
- User redirected to the chat dashboard

## Authentication & User Management → Registration

Add: after form submission, a 6-digit OTP is sent to the user's email before the account is activated.
Add: user is redirected to /verify-email instead of /chat after submitting the registration form.
Add: JWT is only issued after successful OTP verification.

## Authentication & User Management → Login

Add: if a user tries to login with an unverified account, they are redirected to /verify-email with a fresh OTP sent automatically instead of receiving "Invalid credentials".

### Login
- User provides email and password
- Server looks up user by email, compares password against bcrypt hash
- On success: JWT issued, `User.isOnline` set to `true`, Socket.io connection opened
- On failure: generic "Invalid credentials" error (no hint whether email or password was wrong)

### Logout
- JWT cookie cleared
- `User.isOnline` set to `false`, `User.lastSeen` updated
- Socket.io connection closed
- All contacts notified of offline status

### JWT Session Management
- JWT stored as an **HTTP-only cookie** (XSS resistant — not localStorage)
- JWT payload: `{ userId, email, iat, exp }`
- Token expiry: 7 days
- All protected API routes and Socket.io connections verify the JWT via middleware

### Profile Setup & Editing
- Name and avatar set during registration or in profile settings
- Status message editable at any time (max 100 characters)
- Avatar uploaded to Cloudinary (free tier)
- Phone number can be added or updated from settings — no verification step in MVP

### User Discovery
- Users are found by **email** (exact match) or **name** (text search) when starting a new DM
- Search endpoint: `GET /api/users/search?q=<query>` — debounced on the client

### Security
- Passwords: bcrypt (salt rounds: 10+), `select: false` on the Mongoose schema field
- JWT: HTTP-only cookie, SameSite=Strict
- Input validation: Zod on all auth routes
- Rate limiting on login endpoint to prevent brute force

---

## 4.2 Real-Time Chat

### 1-to-1 Chat
- Send & receive text messages
- Typing indicator
- Read receipts (single tick → double tick → blue ticks)
- Message timestamps
- Find users by email or name to start a DM

### Group Chat
- Create group (minimum 3 participants including creator)
- Add/remove participants (admin only)
- Group name & icon
- Admin role with elevated permissions

---

## 4.3 Media Support

- Upload images, videos, PDFs
- Preview media before sending
- Store files on Cloudinary (free tier — 25GB/month)
- Store file metadata in MongoDB (`media` collection)
- Allowed types: jpg, png, gif, webp, mp4, webm, pdf
- Size limits: images ≤ 10MB, videos ≤ 50MB

---

## 4.4 Presence & Status

- Online/offline detection via Socket.io connection lifecycle
- Last seen timestamp (updated on disconnect)
- User-set status message (e.g. "Available", "Busy")

---

## 4.5 Message States

- **Sent** (✓ single grey tick) — saved to server
- **Delivered** (✓✓ double grey ticks) — received by recipient's socket
- **Read** (✓✓ double blue ticks) — recipient has opened the chat

---

## 4.6 Notifications

- Browser push notifications for messages received when tab is not focused
- Sound alert on new message
- Notification permission requested on first use; preference stored in browser

---

# 5. 🚀 Future Features (Phase 2+) — Not Included in MVP

- **Phone verification** — OTP flow for the optional `phone` field (when monetization or identity binding is needed)
- Voice messages
- Voice/video calling (WebRTC)
- Message reactions
- Message edit/delete for everyone
- Pinned chats
- End-to-end encryption
- Multi-device support
- AI smart replies
- Chatbot integration

---

# 6. 🏗 Technical Architecture

## 6.1 Frontend (Next.js)

- Next.js App Router
- Server Components for layout
- Client Components for chat UI
- Redux Toolkit for global state (auth, chat list, active conversation)
- TailwindCSS for styling
- Socket.io Client for real-time communication
- React Hook Form + Zod for all forms

---

## 6.2 Backend (Next.js API Routes)

REST endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register with email + password |
| POST | `/api/auth/login` | Login, issue JWT |
| POST | `/api/auth/logout` | Clear cookie, set offline |
| GET | `/api/users/search?q=` | Search users by name or email |
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me` | Update profile (name, avatar, phone, status) |
| POST | `/api/chats/dm` | Create or retrieve a DM chat |
| POST | `/api/chats/group` | Create a group chat |
| PATCH | `/api/chats/:chatId/participants/add` | Add participant (admin only) |
| PATCH | `/api/chats/:chatId/participants/remove` | Remove participant (admin only) |
| PATCH | `/api/chats/:chatId/leave` | Leave a group |
| GET | `/api/messages?chatId=&before=` | Paginate messages (cursor-based) |
| POST | `/api/messages` | Send a message |
| PATCH | `/api/messages/:id/delete-for-me` | Soft delete a message |
| POST | `/api/media/upload` | Upload file to Cloudinary |


POST /api/auth/verify-email
POST /api/auth/resend-otp

Socket.io events handled server-side: `message:send`, `message:delivered`, `message:read`, `typing:start`, `typing:stop`, `presence:online`, `presence:offline`.

---

## 6.3 Database (MongoDB)

Four collections:

| Collection | Purpose |
|---|---|
| `users` | Accounts identified by email; optional phone field |
| `chats` | DM and group conversation metadata |
| `messages` | All messages across all chats |
| `media` | File metadata for Cloudinary uploads |
Add: a 5th collection — otps — to the collections table.
---

# 7. 🔄 Authentication Flow

```
──────────── REGISTRATION ────────────

User fills: name, email, password, (optional) phone
        │
        ▼
Client-side Zod validation
        │
POST /api/auth/register
        │
        ├── Email already exists? → 409 "Email already in use"
        ├── Password too weak?    → 400 "Password must be at least 8 characters"
        │
        ▼
bcrypt.hash(password, 10)
New User document saved to MongoDB
JWT issued → set as HTTP-only cookie
Redirect → /chat

──────────── LOGIN ────────────

User fills: email, password
        │
        ▼
POST /api/auth/login
        │
        ├── Email not found?     → 401 "Invalid credentials"  (generic — no hint)
        ├── Password mismatch?   → 401 "Invalid credentials"
        │
        ▼
JWT issued → set as HTTP-only cookie
User.isOnline → true
Socket.io connection opened
Redirect → /chat

──────────── LOGOUT ────────────

POST /api/auth/logout
        │
        ▼
JWT cookie cleared
User.isOnline → false
User.lastSeen → Date.now()
Socket.io connection closed
Contacts notified of offline status
Redirect → /login
```

Update the REGISTRATION flow to include the OTP step between "New User document saved" and "JWT issued".
---

# 8. 🔄 Real-Time Communication Flow

1. User sends message → frontend emits `message:send` via Socket.io
2. Server validates JWT and confirms sender is a chat participant
3. Server saves `Message` document to MongoDB
4. Server updates `Chat.lastMessage` (denormalized snapshot)
5. Server broadcasts `message:receive` to all other participants in the chat room
6. Recipients' UIs update in real time
7. Server emits `message:delivered` back to sender → double tick shown

---

# 9. 🔐 Security Requirements

- JWT authentication — HTTP-only cookies (XSS resistant)
- Password hashing — bcrypt (salt rounds 10+), `select: false` on schema
- HTTPS mandatory (enforced by Vercel)
- Rate limiting on auth endpoints (login brute force prevention)
- Input validation — Zod on all API routes
- CORS protection — configured in `next.config.js`
- CSRF protection — SameSite cookie + CORS config
- Secure file upload — MIME type + size validation before Cloudinary
- Non-participant access blocked — middleware verifies chat membership on all message endpoints
- Generic auth error messages — no hint whether email or password was wrong
-Add: OTP generated using crypto.randomInt (cryptographically secure).
Add: rate limiting on /api/auth/verify-email and /api/auth/resend-otp.
Add: unverified accounts cannot access any protected route.
---

# 10. ⚡ Performance Requirements

- Message delivery latency < 500ms
- Infinite scroll with **cursor-based pagination** (`before=<messageId>`) — no `skip/offset`
- MongoDB indexes: `email` (unique), `participants`, `chatId + createdAt`, `senderId`
- Lazy load media (Intersection Observer)
- Debounced user search — 300ms
- Debounced typing stop — 2s idle
- `Chat.lastMessage` denormalized — sidebar loads without aggregation

---

# 11. 📱 UI/UX Requirements

- Responsive, mobile-first layout
- WhatsApp-like structure:
  - Left sidebar: chat list sorted by most recent activity
  - Right panel: active conversation with message history
- Dark / Light mode toggle
- Smooth scrolling with position preservation on history load
- Clean, minimal interface
- OTP / phone UI not required in MVP — phone field is a plain text input in profile settings

---

# 12. 📊 Non-Functional Requirements

| Category | Requirement |
|---|---|
| Scalability | Support 10,000+ concurrent users |
| Reliability | 99.5% uptime |
| Maintainability | Modular folder structure |
| Logging | Centralized logging |
| Monitoring | Vercel Analytics (free tier) |

---

# 13. 📂 Suggested Folder Structure

```
/app
  /api
    /auth
      /register       → POST
      /login          → POST
      /logout         → POST
    /users
      /me             → GET / PATCH
      /search         → GET (by name or email)
    /chats
      /dm             → POST
      /group          → POST
      /[chatId]
        /participants
          /add        → PATCH (admin only)
          /remove     → PATCH (admin only)
        /leave        → PATCH
    /messages         → GET / POST
    /messages/[id]
      /delete-for-me  → PATCH
    /media/upload     → POST
  /(auth)
    /login
    /register
  /(chat)
    /chat             → Main dashboard
    /profile          → Profile settings
/lib
  /models             → Mongoose schemas (User, Chat, Message, Media)
  /middleware         → JWT verification
  /socket             → Socket.io server setup
  /validations        → Zod schemas
  /cloudinary         → Upload helper
/store                → Redux Toolkit slices
/components           → Reusable UI components

Add: /api/auth/verify-email and /api/auth/resend-otp route files.
Add: otps model file under /lib/models.
```

---

# 14. 📅 Development Roadmap

## Phase 1
- Email + password authentication
- Add: email OTP verification as a Phase 1 item (it is now part of core registration).
- Profile setup (name, avatar, optional phone)
- Basic chat UI
- 1-to-1 messaging (text)
- MongoDB schema setup

## Phase 2
- Group chats
- Media uploads (images, video, PDF)
- Presence system (online/offline, last seen, typing)

## Phase 3
- Browser push notifications
- Infinite scroll + pagination
- Performance optimization
- Security hardening (rate limiting, audit)

## Phase 4+ (Post-traction)
- Phone number verification (OTP) when monetization or identity binding is needed
- Voice messages, WebRTC calling, message reactions

---

# 15. 📈 Success Metrics

- DAU/MAU ratio
- Message delivery latency
- Registration conversion rate
- User retention (Day 1 / Day 7 / Day 30)
- Average session duration
- Crash rate

---

# 16. 🛠 DevOps & Deployment

- **Vercel** — free Hobby tier (Next.js native, serverless API routes included)
- **MongoDB Atlas** — M0 free tier (512MB — sufficient for MVP)
- **Cloudinary** — free tier (25GB storage, 25GB bandwidth/month)
- **GitHub Actions** — CI/CD (free for public repos; 2,000 min/month for private)
- Environment variables managed via Vercel Dashboard
- Vercel Analytics (free) for basic monitoring

---

# 17. ⚠ Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Scaling WebSockets | Horizontal scaling + Redis adapter (Phase 2) |
| Database performance | Proper indexing on `email`, `chatId`, `createdAt` |
| Login brute force | Rate limiting on `/api/auth/login` |
| Security breaches | Regular audits, bcrypt, HTTP-only cookies |
| File storage cost | Cloudinary free tier for MVP; CDN + compression for scale |
| User identity abuse | Email uniqueness + optional phone for future binding |
Add a new risk row: email delivery failure — mitigation: resend flow + error handling.
---

# 18. 🔮 Phone Verification Upgrade Path

When the product has traction and a reason to bind real identity:

1. Add `phoneVerified: Boolean` field to the `User` schema
2. Add a unique sparse index on `phone` (allows existing null values)
3. Build an `otps` collection with MongoDB TTL auto-expiry
4. Integrate Twilio or Africa's Talking for SMS delivery
5. Gate phone-dependent features behind `phoneVerified: true`

Because `phone` is already in the schema as an optional plain string, **no data migration is required** — only new infrastructure on top of the existing model.

---

# 19. 📌 Final Notes

This PRD outlines an MVP-level WhatsApp-like chat application built fully with **Next.js (fullstack)** and **MongoDB**.

Using email as the primary identity keeps the MVP entirely free, simple to build, and free of SMS infrastructure costs. The optional phone field is a deliberate placeholder — it costs nothing to store and nothing to verify in MVP, but gives a clean upgrade path once there is a real product reason to add it.

If built with clean architecture and indexing, this can scale into:

- SaaS messaging platform
- Internal team communication tool
- AI-enhanced chat system
- WebRTC-based calling app

---

*ChatSphere PRD v3 · Email-based Identity · Phone Optional (Unverified) · Next.js + MongoDB*
