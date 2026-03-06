# ChatSphere — Features Reference

> Complete feature inventory for the ChatSphere MVP. Covers authentication, messaging, media, presence, UI, security, performance, and the Phase 2+ roadmap.

---

## Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [User Discovery & Search](#2-user-discovery--search)
3. [Real-Time Messaging](#3-real-time-messaging)
4. [Group Chats](#4-group-chats)
5. [Media & File Sharing](#5-media--file-sharing)
6. [Presence & Status](#6-presence--status)
7. [Message States & Delivery Receipts](#7-message-states--delivery-receipts)
8. [Notifications](#8-notifications)
9. [Profile & Settings](#9-profile--settings)
10. [Chat Management](#10-chat-management)
11. [UI & Experience](#11-ui--experience)
12. [Security](#12-security)
13. [Performance & Scalability](#13-performance--scalability)
14. [API Surface](#14-api-surface)
15. [Socket.io Events](#15-socketio-events)
16. [Data Models Summary](#16-data-models-summary)
17. [DevOps & Deployment](#17-devops--deployment)
18. [Phase 2+ Roadmap Features](#18-phase-2-roadmap-features)

---

## 1. Authentication & User Management

### Registration

| Feature | Detail |
|---|---|
| Sign-up fields | Name (required), Email (required), Password (required), Phone (optional) |
| Email uniqueness | Enforced at DB level via unique index; returns `409` if already in use |
| Password strength | Minimum 8 characters; validated via Zod on the API route |
| Password storage | bcrypt hash (salt rounds: 10+); `select: false` — never returned to client |
| Phone field | Optional plain string (E.164 format); stored but **not verified** in MVP |
| Post-registration | JWT issued → HTTP-only cookie set → redirect to `/chat` |

### Login

| Feature | Detail |
|---|---|
| Credentials | Email + password |
| Error handling | Generic `401 "Invalid credentials"` — no hint whether email or password was wrong |
| On success | JWT issued, `User.isOnline = true`, Socket.io connection opened, redirect to `/chat` |
| Rate limiting | Login endpoint rate-limited to prevent brute-force attacks |

### Logout

| Feature | Detail |
|---|---|
| Endpoint | `POST /api/auth/logout` |
| Actions | JWT cookie cleared, `User.isOnline = false`, `User.lastSeen` updated to `Date.now()` |
| Socket | Connection closed; all contacts notified of offline status |
| Redirect | `/login` |

### JWT Session Management

| Feature | Detail |
|---|---|
| Storage | HTTP-only cookie (XSS-resistant — not `localStorage`) |
| Payload | `{ userId, email, iat, exp }` |
| Expiry | 7 days |
| Verification | Custom Next.js middleware verifies JWT on all protected API routes and Socket.io connections |
| Session expiry UX | `401` mid-session triggers redirect to `/login` with a contextual "session expired" banner |

---

## 2. User Discovery & Search

| Feature | Detail |
|---|---|
| Search by email | Exact match lookup via `GET /api/users/search?q=<query>` |
| Search by name | Full-text MongoDB index search on the `name` field |
| Minimum query length | Client enforces at least 2 characters before sending a request |
| Debouncing | 300ms debounce on the client before the API call is fired |
| Results display | Avatar, name, email, online presence dot |
| No results state | "No users found. Try a different name or email address." |
| Starting a DM | Clicking a result calls `POST /api/chats/dm` — navigates to the conversation immediately |

---

## 3. Real-Time Messaging

### 1-to-1 (DM) Chat

| Feature | Detail |
|---|---|
| Text messages | Send and receive in real time via Socket.io |
| Message flow | Client emits `message:send` → server validates, persists to MongoDB, broadcasts `message:receive` to recipient |
| Optimistic UI | Message appears immediately on send; pending state shown (clock icon) until server confirms |
| Send failure | Bubble turns red with a retry icon; tooltip "Failed to send. Tap to retry." |
| Typing indicator | Emitted via `typing:start` / `typing:stop`; shown as animated bouncing dots in the chat area |
| Typing stop debounce | 2 seconds of idle input before `typing:stop` is emitted |
| Timestamps | Shown on every message bubble (`--text-xs`) |
| Date separators | "Today", "Yesterday", day name, or full date between messages from different calendar days |
| Message character limit | 4,000 characters; live counter shown when > 3,500 chars typed |
| Scroll position | Preserved when loading older messages; auto-scrolls to bottom on new message if user is at bottom |
| "New message" banner | Sticky banner above the input bar if a new message arrives while user is scrolled up; click scrolls to bottom |

### Cursor-based Pagination

| Feature | Detail |
|---|---|
| Endpoint | `GET /api/messages?chatId=&before=<messageId>` |
| Page size | 30 messages per page |
| Trigger | Intersection Observer on the top sentinel element in the message list |
| Loading state | Spinner shown at top of message list while fetching older messages |
| End of history | "— Beginning of conversation —" chip shown when all messages are loaded |

### Soft Delete (Delete for Me)

| Feature | Detail |
|---|---|
| Mechanism | Adds the user's ID to `Message.deletedFor[]` array — message is not removed from DB |
| Visibility | Deleted message is hidden only for the user who deleted it |
| Other participants | Can still see the message; their view is unaffected |
| Hard delete | Only occurs if `deletedFor` contains all chat participants |

---

## 4. Group Chats

### Creation

| Feature | Detail |
|---|---|
| Minimum participants | 3 (creator + at least 2 others) |
| Maximum participants | 256 (enforced in UI chip counter) |
| Required fields | Group name (required), group icon (optional) |
| Creation flow | Two-step modal: Step 1 — add participants; Step 2 — set name and icon |
| Admin | Chat creator becomes the group admin automatically |

### Admin Controls

| Feature | Detail |
|---|---|
| Add participants | `PATCH /api/chats/:chatId/participants/add` — admin only |
| Remove participants | `PATCH /api/chats/:chatId/participants/remove` — admin only |
| Edit group name | Inline edit from Group Info panel — admin only |
| Edit group icon | Camera overlay on group avatar in Group Info panel — admin only |

### Member Actions

| Feature | Detail |
|---|---|
| Leave group | `PATCH /api/chats/:chatId/leave` — available to all members |
| Leave confirmation | Confirmation dialog before leaving |
| System messages | "Alice joined", "Bob left", "Group created" shown as centered chip messages |
| Sender attribution | Sender name (coloured by user ID hash) + avatar shown above incoming bubbles |

---

## 5. Media & File Sharing

### Supported Types & Limits

| Type | Allowed Formats | Max Size |
|---|---|---|
| Images | JPG, PNG, GIF, WEBP | 10 MB |
| Videos | MP4, WEBM | 50 MB |
| Documents | PDF | 10 MB |

### Upload Flow

| Feature | Detail |
|---|---|
| Upload endpoint | `POST /api/media/upload` |
| Handling | `formidable` parses multipart form data server-side |
| Storage | Files uploaded to **Cloudinary** (free tier: 25 GB storage / 25 GB bandwidth per month) |
| Metadata | Stored in the `media` MongoDB collection: URL, `publicId`, resource type, MIME type, size, uploader |
| Validation | MIME type + file extension whitelist checked **before** Cloudinary upload |
| Pre-send preview | Thumbnail (image/video) or file card (PDF) shown above the input bar with a progress bar |
| Progress indicator | "Uploading… 47%" shown during upload; send button disabled until complete |
| Cancel upload | × button on the preview removes the file selection |

### Media Rendering in Chat

| Type | In-chat Display |
|---|---|
| Image | Inline thumbnail, max 240×240 px; click opens lightbox |
| Video | Thumbnail with play overlay; click opens inline player / lightbox |
| PDF / File | Card bubble: file icon + name + size + download button |
| Lazy loading | Intersection Observer — media only loads when the bubble scrolls into view |

### Media Viewer (Lightbox)

| Feature | Detail |
|---|---|
| Trigger | Clicking any image or video thumbnail |
| Layout | Full-screen overlay, `rgba(0,0,0,0.92)` backdrop |
| Controls | Close (×), download, left/right navigation between media in the chat |
| Keyboard | `Escape` closes; `ArrowLeft`/`ArrowRight` navigates |
| Sender info | Sender avatar + name + timestamp shown top-left |
| Caption | Shown below media if the message included caption text |

---

## 6. Presence & Status

| Feature | Detail |
|---|---|
| Online detection | Socket.io connection lifecycle — user is `isOnline: true` when socket is connected |
| Offline detection | `isOnline: false` + `lastSeen: Date.now()` set on socket disconnect / logout |
| Contact notification | All contacts notified of online/offline status changes via Socket.io presence events |
| Online indicator | Green dot (`--color-online`) on avatar in sidebar, chat header, contact info panel |
| Last seen display | "Online", "Last seen today at 14:32", "Last seen yesterday", "Last seen X days ago" |
| Status message | User-editable string, max 100 characters (e.g. "Available", "Busy") |
| Status display | Shown in Contact Info panel and profile page |

---

## 7. Message States & Delivery Receipts

| State | Icon | Colour | Meaning |
|---|---|---|---|
| Pending | Clock/spinner | Grey | Optimistic send — awaiting server confirmation |
| Sent | ✓ (single tick) | `--color-tick-grey` | Saved to MongoDB server |
| Delivered | ✓✓ (double tick) | `--color-tick-grey` | Received by recipient's Socket.io connection |
| Read | ✓✓ (double tick) | `--color-tick-blue` | Recipient has opened the conversation |
| Failed | ⟳ retry icon | Red tint on bubble | Network/server error; tap to retry |

Tick icons are only shown on **outgoing** messages. Group chats track delivery/read per participant via `deliveredTo[]` and `readBy[]` arrays on the Message document.

---

## 8. Notifications

| Feature | Detail |
|---|---|
| Browser push notifications | Web Push API (native browser — no third-party service) |
| Permission request | Shown on first visit to `/chat` via a dismissable banner at the top |
| Permission banner | "Enable notifications to get alerts for new messages." with an "Enable" button |
| Dismissal | Stored in `localStorage`; banner does not reappear in the same session |
| Sound alert | Audio played on new message when tab is not focused |
| Preference storage | Notification and sound preferences stored in browser `localStorage` |
| Notification content | Sender name + message preview (or "[Image]", "[File]" for media) |
| When triggered | Only when the browser tab is not focused / not in the foreground |

---

## 9. Profile & Settings

### Profile Fields

| Field | Editable | Notes |
|---|---|---|
| Full Name | ✅ Yes | Required; displayed in all chat contexts |
| Email | ❌ No | Read-only; primary identity; lock icon shown in input |
| Avatar | ✅ Yes | Uploaded to Cloudinary; circular preview with camera overlay; up to 10 MB |
| Status Message | ✅ Yes | Max 100 chars; live character counter |
| Phone Number | ✅ Yes | Optional; E.164 format; not verified in MVP |

### Preferences

| Setting | Detail |
|---|---|
| Theme | Light / Dark mode toggle; persisted in `localStorage` |
| Sound alerts | Toggle for new message sound; persisted in `localStorage` |
| Browser notifications | Status chip (Enabled / Disabled / Blocked); "Enable" button triggers permission request |

### Account Actions

| Action | Detail |
|---|---|
| Save Changes | Calls `PATCH /api/users/me`; button disabled when no fields have changed |
| Logout | Calls `POST /api/auth/logout` from the danger zone section |

---

## 10. Chat Management

### DM Chats

| Feature | Detail |
|---|---|
| Create or retrieve DM | `POST /api/chats/dm` — returns existing chat if one already exists between the two users |
| Duplicate prevention | Pre-create query: `{ isGroup: false, participants: { $all: [A, B], $size: 2 } }` |
| Sidebar order | Sorted by `Chat.updatedAt` descending (most recent activity first) |
| Last message preview | Denormalized `lastMessage` snapshot on Chat document; updated on every new message |
| Sidebar filter | Client-side text filter on chat name; does not query the server |

### Group Chats

| Feature | Detail |
|---|---|
| Create group | `POST /api/chats/group` |
| Sidebar display | Group icon (or initials fallback) + group name + last message preview |
| Unread badge | Green pill with unread count; hidden when count = 0 |

### Message Context Menu

| Action | Available To | Notes |
|---|---|---|
| Delete for me | All participants | Soft delete — `deletedFor[]` updated |
| Copy text | All, text messages only | Copies message content to clipboard |
| Download | All, media messages only | Triggers file download |
| Message info | Sender only (outgoing) | Shows full delivery/read status |
| Reply (Phase 2) | All | Greyed out in MVP |
| Forward (Phase 2) | All | Greyed out in MVP |

---

## 11. UI & Experience

### Layout

| Feature | Detail |
|---|---|
| Two-panel layout | Left sidebar (360 px) + right chat panel (remaining width) |
| Mobile layout | Single-column: sidebar is full screen; selecting a chat pushes to full-screen chat view |
| Responsive breakpoints | Mobile < 768 px; Tablet 768–1023 px; Desktop ≥ 1024 px |
| Mobile input | Safe-area insets (`env(safe-area-inset-bottom)`) for notched phones; keyboard pushes input bar up |
| Fixed height | `100vh` with no page scroll — all scrolling is internal to panels |

### Theming

| Feature | Detail |
|---|---|
| Light mode | WhatsApp-inspired: warm grey chat background (`#E5DDD5`), dark teal header, green primary |
| Dark mode | Inverted surfaces: `#111B21` base, `#0B141A` chat background, `#005C4B` outgoing bubbles |
| Toggle | Sun/moon icon button; preference persisted in `localStorage` |
| Design tokens | CSS custom properties for all colours, typography, spacing, radii, and shadows |

### Skeleton & Loading States

| State | Detail |
|---|---|
| Sidebar skeleton | 6 placeholder chat items with shimmer animation on initial load |
| Message list skeleton | 8–10 placeholder bubbles (alternating left/right) while messages fetch |
| Shimmer animation | `linear-gradient` sweep, 1.5 s infinite — consistent across all skeleton elements |
| Fade-in | Real content fades in (`opacity 0→1`, 150 ms) when data arrives |

### Toast System

| Type | Trigger Examples |
|---|---|
| Success | "Profile updated.", "Group created.", "Message deleted." |
| Error | "Something went wrong.", "Media upload failed.", "Invalid email or password." |
| Info | "1 new message ↓", "Your session has expired." |
| Warning | "Too many login attempts. Try again in 5 minutes." |

Toasts auto-dismiss after 4 seconds with a draining progress bar; stacked (max 3 visible).

### Empty States

| Zone | Message |
|---|---|
| Chat list (no chats) | "No chats yet. Start a conversation by searching for someone." + "New Chat" CTA |
| Chat area (no messages) | "No messages yet. Send a message to start the conversation." |
| User search (no results) | "No users found. Try a different name or email address." |
| Shared media (none) | "No shared media yet." |

### Avatar Fallback

When no avatar image is set, a colored circle with the user's initials is shown. Color is generated deterministically from the user's `_id` for consistency across all sessions and participants.

---

## 12. Security

| Concern | Implementation |
|---|---|
| Authentication | JWT in HTTP-only cookies (XSS-resistant; not `localStorage`) |
| CSRF protection | `SameSite=Strict` cookie + CORS config in `next.config.js` |
| Password hashing | bcryptjs, salt rounds: 10+; `select: false` on Mongoose schema |
| Input validation | Zod schemas on **all** API routes (registration, login, profile update, message send, media upload) |
| Rate limiting | `upstash/ratelimit` or custom in-memory limiter on `/api/auth/login` |
| Brute force prevention | Generic auth error messages — no hint whether email or password was wrong |
| Chat membership enforcement | Middleware verifies the requesting user is a participant before any message read/write |
| File upload security | MIME type + file extension whitelist validated server-side before Cloudinary upload |
| HTTPS | Enforced by Vercel; all traffic encrypted in transit |
| XSS | Next.js escapes output by default; no `dangerouslySetInnerHTML` for user content |
| Socket.io auth | JWT verified on every Socket.io connection and message event |

---

## 13. Performance & Scalability

| Concern | Implementation |
|---|---|
| Message pagination | Cursor-based (`before=<messageId>`) — no `skip/offset`; scales to large histories |
| MongoDB indexes | `email` (unique), `name` (text), `participants`, `updatedAt DESC`, `chatId + createdAt DESC`, `senderId` |
| Sidebar performance | `Chat.lastMessage` denormalized — sidebar renders without aggregation queries |
| Lazy media loading | Intersection Observer — images/videos only load when scrolled into the viewport |
| Debounced search | 300 ms debounce on user search input |
| Debounced typing stop | 2 s idle before `typing:stop` emitted — reduces Socket.io event volume |
| Message delivery latency | Target < 500 ms end-to-end |
| Real-time presence | In-memory via Socket.io (no Redis required for MVP) |
| Concurrent users target | 10,000+ (Redis adapter for Socket.io listed for Phase 2 horizontal scaling) |
| Uptime target | 99.5% |

---

## 14. API Surface

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register with email + password | Public |
| POST | `/api/auth/login` | Login, issue JWT cookie | Public |
| POST | `/api/auth/logout` | Clear cookie, set offline | Protected |
| GET | `/api/users/me` | Get current user profile | Protected |
| PATCH | `/api/users/me` | Update name, avatar, phone, status | Protected |
| GET | `/api/users/search?q=` | Search users by name or email | Protected |
| POST | `/api/chats/dm` | Create or retrieve a DM chat | Protected |
| POST | `/api/chats/group` | Create a group chat | Protected |
| PATCH | `/api/chats/:chatId/participants/add` | Add participant (admin only) | Protected |
| PATCH | `/api/chats/:chatId/participants/remove` | Remove participant (admin only) | Protected |
| PATCH | `/api/chats/:chatId/leave` | Leave a group | Protected |
| GET | `/api/messages?chatId=&before=` | Paginate messages (cursor-based) | Protected |
| POST | `/api/messages` | Send a message | Protected |
| PATCH | `/api/messages/:id/delete-for-me` | Soft-delete a message for self | Protected |
| POST | `/api/media/upload` | Upload file to Cloudinary | Protected |

---

## 15. Socket.io Events

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `message:send` | Client → Server | `{ chatId, content, type, media? }` | User sends a message |
| `message:receive` | Server → Client | Full `Message` object | Broadcast to all other participants |
| `message:delivered` | Server → Client | `{ messageId, userId }` | Notify sender of delivery |
| `message:read` | Client → Server | `{ messageId, chatId }` | User has opened the chat |
| `typing:start` | Client → Server | `{ chatId }` | User started typing |
| `typing:stop` | Client → Server | `{ chatId }` | User stopped typing |
| `presence:online` | Server → Client | `{ userId }` | User came online |
| `presence:offline` | Server → Client | `{ userId, lastSeen }` | User went offline |

---

## 16. Data Models Summary

### `users`
Stores registered accounts. Email is the primary identity (unique, required). Password bcrypt-hashed with `select: false`. Phone is optional and unverified in MVP.

Key fields: `email`, `password`, `phone?`, `name`, `avatar`, `statusMessage`, `isOnline`, `lastSeen`.

### `chats`
Represents a DM or group conversation. Holds participant refs and a denormalized `lastMessage` snapshot for sidebar performance.

Key fields: `isGroup`, `participants[]`, `name?`, `icon?`, `admin?`, `lastMessage`.

### `messages`
Every individual message across all chats. Tracks delivery/read status as arrays of user refs to support both DMs and groups.

Key fields: `chatId`, `senderId`, `type`, `content`, `media?`, `status.deliveredTo[]`, `status.readBy[]`, `deletedFor[]`, `replyTo?`.

### `media`
Metadata for Cloudinary-hosted files. Keeps Message documents lean and allows independent media lifecycle management.

Key fields: `uploadedBy`, `url`, `publicId`, `resourceType`, `mimeType`, `sizeBytes`.

---

## 17. DevOps & Deployment

| Layer | Tool | Notes |
|---|---|---|
| Hosting | Vercel (Hobby free tier) | Native Next.js deployment; serverless API routes included |
| Database | MongoDB Atlas (M0 free tier) | 512 MB storage; sufficient for MVP |
| Media storage | Cloudinary (free tier) | 25 GB storage + 25 GB bandwidth/month |
| CI/CD | GitHub Actions | Free for public repos; 2,000 min/month for private |
| Environment variables | Vercel Dashboard | Secure env var management |
| Monitoring | Vercel Analytics (free) | Basic traffic and performance analytics |
| HTTPS | Vercel (enforced) | All traffic TLS-encrypted |

---

## 18. Phase 2+ Roadmap Features

These features are **not included in MVP** but are architecturally prepared for.

### Near-term (Phase 2)

| Feature | Notes |
|---|---|
| Phone number verification | OTP flow via Twilio / Africa's Talking; `phoneVerified` flag + sparse unique index on `phone`; no data migration required |
| Reply to message | `Message.replyTo` field already in schema; UI hook points in context menu |
| Message reactions | Emoji reaction overlay on bubbles |
| Message edit / delete for everyone | Server-side update + Socket.io broadcast |
| Redis adapter for Socket.io | Horizontal scaling of WebSocket connections across multiple Vercel instances |
| Voice messages | In-browser audio recording + upload as media |
| Pinned chats | Pinned flag on Chat document; pinned section at top of sidebar |

### Medium-term (Phase 3)

| Feature | Notes |
|---|---|
| WebRTC voice calling | Peer-to-peer with signaling via Socket.io |
| WebRTC video calling | Extends the voice calling infrastructure |
| End-to-end encryption | Signal Protocol or libsodium; significant architecture change |
| Multi-device support | Session management across multiple JWT tokens per user |
| Message forwarding | Forward any message to another chat |
| Chat muting | Per-chat notification mute; `muted` flag on Chat document |

### Long-term (Phase 4+)

| Feature | Notes |
|---|---|
| AI smart replies | Suggested quick-reply chips powered by a language model |
| Chatbot / agent integration | Bot user accounts with API-driven message sending |
| Status updates (WhatsApp Stories) | Time-limited media posts visible to contacts |
| SaaS / team workspace | Multi-tenant architecture; workspace-scoped chats and members |

---

## Phone Verification Upgrade Path

When the product has traction and requires identity binding, no data migration is needed:

```ts
// 1. Add sparse unique index (existing null values are unaffected)
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });

// 2. Add phoneVerified flag
phoneVerified: { type: Boolean, default: false }

// 3. Build OTP collection with MongoDB TTL auto-expiry
// 4. Integrate Twilio / Africa's Talking for SMS delivery
// 5. Gate phone-dependent features behind phoneVerified: true
```

Because `phone` is already stored as a plain optional string in every user document, adding verification is purely additive infrastructure — no existing records need to change.

---

*ChatSphere Features Reference v1.0 · MVP · Next.js + MongoDB + Socket.io · Email-based Identity*
