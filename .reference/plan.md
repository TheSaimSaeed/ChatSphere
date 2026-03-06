# ChatSphere — Development Plan

> Solo developer · Portfolio project · Vertical slice approach
> Stack: Next.js 14 · TypeScript · MongoDB · Socket.io · TailwindCSS · Cloudinary
> Estimated total: **4–5 weeks** at a sustainable solo pace

---

## Table of Contents

1. [Guiding Principles](#1-guiding-principles)
2. [Slice Overview](#2-slice-overview)
3. [Slice 1 — Project Foundation](#3-slice-1--project-foundation)
4. [Slice 2 — Authentication](#4-slice-2--authentication)
5. [Slice 3 — Chat Layout & User Search](#5-slice-3--chat-layout--user-search)
6. [Slice 4 — Real-Time 1-to-1 Messaging](#6-slice-4--real-time-1-to-1-messaging)
7. [Slice 5 — Message States & Typing Indicator](#7-slice-5--message-states--typing-indicator)
8. [Slice 6 — Presence System](#8-slice-6--presence-system)
9. [Slice 7 — Profile & Settings](#9-slice-7--profile--settings)
10. [Slice 8 — Group Chats](#10-slice-8--group-chats)
11. [Slice 9 — Media Sharing](#11-slice-9--media-sharing)
12. [Slice 10 — Message Context Menu & Soft Delete](#12-slice-10--message-context-menu--soft-delete)
13. [Slice 11 — Polish, Hardening & Deployment](#13-slice-11--polish-hardening--deployment)
14. [Parallel Tasks (Run Throughout)](#14-parallel-tasks-run-throughout)
15. [Definition of Done](#15-definition-of-done)
16. [Folder Structure](#16-folder-structure)
17. [Environment Variables](#17-environment-variables)
18. [Full Timeline at a Glance](#18-full-timeline-at-a-glance)

---

## 1. Guiding Principles

**One slice at a time.** Never start a new slice until the current one is fully done — API working, UI wired to the real API (no mocks), happy path and at least one error case manually tested.

**Deploy after Slice 4.** Having a live URL early means you build against the real environment and can share a link the moment someone asks. Don't wait until the end.

**Code quality over feature count.** Reviewers read code. A clean, well-structured codebase with 8 solid features beats a messy codebase with 12.

**Portfolio-first decisions.** Notifications (browser push) are skipped — invisible during a demo. Dark mode, skeleton states, and mobile responsiveness are not optional polish — they're what separates "toy project" from "production-ready" in a reviewer's eyes.

**Document decisions as you go.** The README and architectural notes should be written alongside the code, not after.

---

## 2. Slice Overview

| # | Slice | Backend | Frontend | Est. Time |
|---|---|---|---|---|
| 1 | Project Foundation | DB, models, middleware, env | Project scaffold, design tokens | 1–2 days |
| 2 | Authentication | Register, login, logout APIs | `/login`, `/register` pages | 2–3 days |
| 3 | Chat Layout & User Search | User search, DM create/retrieve | Dashboard shell, sidebar, New DM overlay | 2–3 days |
| 4 | Real-Time 1-to-1 Messaging | Messages API, Socket.io server | Message area, input bar, optimistic UI, pagination | 3–4 days |
| 5 | Message States & Typing | Delivered/read events, typing relay | Tick icons, typing indicator | 1–2 days |
| 6 | Presence | Online/offline events, lastSeen | Online dots, last seen display | 1 day |
| 7 | Profile & Settings | PATCH /users/me, avatar upload | `/profile` page, preferences | 1–2 days |
| 8 | Group Chats | Group APIs, admin middleware | Group modal, group chat UI, Group Info panel | 2–3 days |
| 9 | Media Sharing | Upload API, Cloudinary, media messages | Attach flow, previews, lightbox | 2–3 days |
| 10 | Context Menu & Soft Delete | Delete-for-me API | Context menu, confirmation dialog | 1 day |
| 11 | Polish, Hardening & Deployment | Rate limiting audit, Zod audit | Skeletons, empty states, toasts, dark mode, mobile | 3–4 days |
| — | **Total** | | | **~19–31 days** |

---

## 3. Slice 1 — Project Foundation

**Goal:** A running Next.js app connected to MongoDB with all schemas defined and all shared infrastructure in place. No features yet — just a solid base everything else builds on.

**Why first:** JWT middleware, Zod schemas, and Mongoose models are imported by every subsequent slice. Building them once here prevents rewrites later.

### Backend Tasks

- [ ] Initialise Next.js 14 project with TypeScript: `npx create-next-app@latest chatsphere --typescript --tailwind --app`
- [ ] Install all dependencies (see package list below)
- [ ] Connect Mongoose to MongoDB Atlas — `lib/db.ts` with connection caching to avoid hot-reload reconnects in development
- [ ] Define all 4 Mongoose schemas: `User`, `Chat`, `Message`, `Media` — exactly as specified in `dataModels.md`
- [ ] Apply all indexes: `email` (unique), `name` (text), `participants`, `updatedAt DESC`, `chatId + createdAt DESC`, `senderId`
- [ ] Write JWT utility functions: `signToken(payload)`, `verifyToken(token)` — `lib/jwt.ts`
- [ ] Write Next.js middleware for protected routes: `middleware.ts` — reads JWT from cookie, redirects to `/login` if invalid
- [ ] Write Socket.io auth middleware: verify JWT on connection, attach `userId` to socket
- [ ] Define all Zod validation schemas: `lib/validations/` — `authSchemas.ts`, `messageSchemas.ts`, `chatSchemas.ts`, `mediaSchemas.ts`
- [ ] Set up environment variable types: `lib/env.ts` with Zod-parsed `process.env`
- [ ] Configure `next.config.js`: CORS headers, image domains (Cloudinary)

### Frontend Tasks

- [ ] Configure TailwindCSS with all design tokens from `UIScreens.md` section 1 as CSS custom properties in `globals.css`
- [ ] Set up Redux Toolkit store: `store/index.ts` with empty slices for `auth`, `chat`, `ui`
- [ ] Create base layout components: `Avatar` (with initials fallback + deterministic color), `Spinner`, `Toast` (all 4 variants), `IconButton`
- [ ] Set up Socket.io client singleton: `lib/socket.ts` — initialised once, exported for use in components
- [ ] Create route groups: `(auth)` for `/login` and `/register`, `(chat)` for `/chat` and `/profile`

### Key Files Created

```
/lib
  db.ts
  jwt.ts
  socket.ts
  env.ts
  /models
    User.ts
    Chat.ts
    Message.ts
    Media.ts
  /validations
    authSchemas.ts
    messageSchemas.ts
    chatSchemas.ts
    mediaSchemas.ts
/middleware.ts
/store
  index.ts
  /slices
    authSlice.ts      (empty)
    chatSlice.ts      (empty)
    uiSlice.ts        (empty)
/components
  Avatar.tsx
  Spinner.tsx
  Toast.tsx
  IconButton.tsx
/app
  globals.css         (design tokens)
  layout.tsx
```

### Packages to Install

```bash
# Core
npm install mongoose socket.io socket.io-client

# Auth
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs

# Validation
npm install zod react-hook-form @hookform/resolvers

# State
npm install @reduxjs/toolkit react-redux

# Media
npm install cloudinary formidable
npm install -D @types/formidable

# Utilities
npm install date-fns uuid cookie
npm install -D @types/uuid @types/cookie

# Icons
npm install lucide-react

# Rate limiting
npm install @upstash/ratelimit @upstash/redis
```

### Done When

- `npm run dev` starts without errors
- Mongoose connects to Atlas and logs "MongoDB connected"
- All model files export valid Mongoose models
- `verifyToken` correctly validates and rejects JWTs
- Navigating to `/chat` without a cookie redirects to `/login`

---

## 4. Slice 2 — Authentication

**Goal:** Full registration and login flow with JWT sessions. A user can create an account, log in, stay logged in across page refreshes, and log out.

**Why second:** Every other slice requires an authenticated user. Nothing else can be built without this.

### Backend Tasks

- [ ] `POST /api/auth/register`
  - Zod validate: name, email (format), password (min 8), phone (E.164 regex, optional)
  - Check email uniqueness → `409` if taken
  - `bcrypt.hash(password, 10)`
  - Save `User` document
  - Sign JWT, set HTTP-only cookie (`SameSite=Strict`, 7-day expiry)
  - Return user object (without password)
- [ ] `POST /api/auth/login`
  - Zod validate inputs
  - Find user by email (`select('+password')` to fetch the hidden field)
  - `bcrypt.compare` — return generic `401 "Invalid credentials"` on any mismatch
  - Set `User.isOnline = true`
  - Sign JWT, set HTTP-only cookie
  - Return user object
- [ ] `POST /api/auth/logout`
  - Clear the JWT cookie
  - Set `User.isOnline = false`, `User.lastSeen = Date.now()`
  - Return `200`
- [ ] `GET /api/users/me`
  - Verify JWT middleware
  - Return current user profile (no password)
- [ ] Apply rate limiting to `/api/auth/login`: max 10 attempts per IP per 15 minutes

### Frontend Tasks

- [ ] `/login` page — per `UIScreens.md` section 2
  - React Hook Form + Zod resolver
  - Email + password fields, eye toggle on password
  - Inline field validation errors
  - Form-level error banner for `401` response
  - Rate limit error banner for `429` response
  - Session expired amber banner (shown when `?expired=true` query param is present)
  - Loading state: spinner + "Signing in…", all inputs disabled
  - On success: dispatch to `authSlice`, redirect to `/chat`
- [ ] `/register` page — per `UIScreens.md` section 3
  - Name, email, password, phone (optional) fields
  - Password strength bar (4 segments: red → orange → yellow → green)
  - Phone hint text: "E.164 format. Stored for future features. Not verified."
  - `409` error: inline "This email is already registered. Sign in instead?" with link
  - On success: dispatch to `authSlice`, redirect to `/chat`
- [ ] `authSlice` — store `{ user, isAuthenticated }`
- [ ] Two-column desktop layout (branding panel left, form right) — hidden branding panel on mobile
- [ ] Dark/Light mode toggle (sun/moon icon, top-right corner)

### Done When

- Register a new account → lands on `/chat` (empty for now)
- Try to register with same email → see inline `409` error
- Log out → cookie cleared, redirected to `/login`
- Log back in → lands on `/chat`, user persists across refresh
- Navigate to `/chat` without cookie → redirected to `/login`
- 11th login attempt within 15 min → rate limit error banner

---

## 5. Slice 3 — Chat Layout & User Search

**Goal:** The full dashboard shell with a working sidebar and New DM overlay. A logged-in user can search for other users and open a (currently empty) DM conversation.

### Backend Tasks

- [ ] `GET /api/users/search?q=<query>`
  - Require `q` param, min 2 characters
  - Search by exact email (`User.findOne({ email: q })`) OR name text search (`$text: { $search: q }`)
  - Exclude the requesting user from results
  - Return array of `{ _id, name, email, avatar, isOnline }`
- [ ] `GET /api/chats` (new endpoint needed for sidebar)
  - Return all chats where `participants` includes `req.userId`
  - Populate `participants` with `name, avatar, isOnline, lastSeen`
  - Sort by `updatedAt DESC`
- [ ] `POST /api/chats/dm`
  - Validate: `recipientId` exists and is not the requesting user
  - Check for existing DM: `{ isGroup: false, participants: { $all: [userId, recipientId], $size: 2 } }`
  - If exists: return existing chat
  - If not: create new `Chat` document, return it
  - Populate participants on return

### Frontend Tasks

- [ ] `/chat` dashboard layout — two-panel shell
  - Left sidebar `360px` fixed, full-screen on mobile
  - Right panel `flex-1`, shows welcome state by default
  - `100vh` height, no page scroll, each panel scrolls independently
- [ ] Sidebar Header (Zone A) — per `UIScreens.md` section 4.1
  - Current user avatar (links to `/profile`)
  - "ChatSphere" wordmark
  - New Group icon (wired to nothing yet — Slice 8)
  - New DM icon (opens search overlay)
  - More options dropdown: "Profile", "Logout"
- [ ] Sidebar Search Bar (Zone B)
  - Client-side filter of the chat list (not a server call)
  - Clears with × button
- [ ] Chat List (Zone C)
  - Fetch chats on mount via `GET /api/chats`, store in `chatSlice`
  - Render `ChatListItem` for each: avatar, name, last message preview, timestamp, unread badge (placeholder 0 for now), online dot for DMs
  - Empty state: "No chats yet. Start a conversation by searching for someone." + "New Chat" button
  - Active item: left border highlight + background tint
  - Sort order maintained by `updatedAt`
- [ ] New DM Search Overlay — per `UIScreens.md` section 5
  - Slides in over sidebar content
  - Auto-focused search input
  - 300ms debounced API call to `GET /api/users/search`
  - Loading indicator while fetching
  - Result items: avatar, name, email, online dot
  - "Type at least 2 characters to search." hint
  - "No users found." empty state
  - Click result → `POST /api/chats/dm` → navigate to chat → close overlay
- [ ] Right panel Welcome state — per `UIScreens.md` section 4.2
- [ ] `chatSlice` — store `{ chats[], activeChatId }`

### Done When

- Dashboard loads, sidebar shows all existing chats
- Typing in the sidebar search bar filters the chat list locally
- Clicking New DM opens the overlay, searching finds real users
- Clicking a search result creates (or retrieves) a DM and selects it in the sidebar
- Right panel shows the welcome state when no chat is selected

---

## 6. Slice 4 — Real-Time 1-to-1 Messaging

**Goal:** Two users can send and receive text messages in real time. This is the centrepiece of the portfolio — give it the most time and get it right.

### Backend Tasks

- [ ] Socket.io server setup — `lib/socket/server.ts`
  - Initialise on the custom Next.js server (or via `server.ts` if using a standalone server)
  - Verify JWT on `connection` event; attach `userId` to socket; disconnect if invalid
  - Join socket to a room per `chatId` when user opens a chat
  - Handle `message:send` event:
    1. Validate sender is a participant of the `chatId`
    2. Save `Message` document to MongoDB
    3. Update `Chat.lastMessage` atomically
    4. Emit `message:receive` to all other sockets in the chat room
    5. Emit `message:delivered` back to sender
- [ ] `POST /api/messages`
  - REST fallback for message send (used if socket is temporarily unavailable)
  - Same validation and save logic as socket handler
- [ ] `GET /api/messages?chatId=&before=`
  - Verify user is a participant of the chat
  - Cursor-based pagination: `Message.find({ chatId, _id: { $lt: before } }).sort({ createdAt: -1 }).limit(30)`
  - If no `before` param: return the latest 30 messages
  - Populate `senderId` with `name, avatar`; populate `media`
  - Return messages in ascending order (reverse the descending query result) for correct rendering

### Frontend Tasks

- [ ] Right Panel — Active DM Conversation (Zone A: Chat Header) — per `UIScreens.md` section 4.3
  - Contact avatar, name, presence/last seen sub-line
  - More options dropdown: "View Contact" (wires to Slice 7)
- [ ] Message Area (Zone B)
  - Fetch first page of messages on chat open via `GET /api/messages?chatId=`
  - Render message bubbles: outgoing (right, green) vs incoming (left, white)
  - Bubble details: text, timestamp, tail/arrow, max-width 65%
  - Date separator chips between messages from different calendar days
  - "Beginning of conversation" chip when all pages loaded
  - Auto-scroll to bottom on initial load and when new message arrives (if user is at bottom)
  - Cursor-based infinite scroll: Intersection Observer on top sentinel → fetch next page → prepend messages → preserve scroll position
  - Loading spinner at top during pagination fetch
  - Optimistic UI: message appears immediately on send with a pending state (clock icon)
  - Send failure: bubble turns red tint with ⟳ retry icon
  - "New message ↓" sticky banner when new message arrives while scrolled up; click scrolls to bottom
- [ ] Message Input Bar (Zone D) — per `UIScreens.md` section 4.3
  - Auto-expanding textarea (max ~5 lines)
  - Character counter appears at 3,500+ chars
  - Send button (paper plane icon): visible only when input has non-whitespace content
  - `Enter` to send, `Shift+Enter` for new line
  - Emit `message:send` via Socket.io on send; also call REST fallback if socket is down
  - Clear input after send
- [ ] Socket.io client integration
  - Connect socket on login (after JWT is set), disconnect on logout
  - Listen for `message:receive` → append to message list in `chatSlice`, update `lastMessage` in sidebar
  - `chatSlice` message state: `{ messagesByChatId: { [chatId]: Message[] } }`
- [ ] Deploy to Vercel after this slice is complete (see Slice 11 for full deploy checklist)

### Done When

- Two browser tabs (different users) can exchange text messages in real time
- Sending a message updates the sender's sidebar immediately (lastMessage, timestamp)
- Recipient's sidebar also updates in real time (Socket.io broadcast)
- Scrolling to the top loads the previous 30 messages without losing scroll position
- The "Beginning of conversation" chip appears when all messages are loaded
- The "New message ↓" banner appears and works correctly
- A failed send shows the retry UI

---

## 7. Slice 5 — Message States & Typing Indicator

**Goal:** Sent/delivered/read ticks work correctly. The typing indicator appears and disappears in real time.

### Backend Tasks

- [ ] Socket.io: `message:delivered` — already emitted after broadcast in Slice 4; update `Message.status.deliveredTo[]` in DB
- [ ] Socket.io: handle `message:read` event from client
  - Add `userId` to `Message.status.readBy[]` for all unread messages in the opened chat
  - Emit `message:read` back to the sender with `{ chatId, readBy: userId }`
- [ ] Socket.io: relay `typing:start` and `typing:stop` events
  - Broadcast to all other participants in the chat room (not back to sender)
  - No DB persistence needed

### Frontend Tasks

- [ ] Tick icons on outgoing message bubbles
  - Pending: clock icon (optimistic, before server confirm)
  - Sent: single grey tick ✓
  - Delivered: double grey tick ✓✓
  - Read: double blue tick ✓✓ (`--color-tick-blue`)
  - Store message status in `chatSlice`; update on receiving `message:delivered` and `message:read` socket events
- [ ] Emit `message:read` when the user opens a chat (and when new messages arrive while the chat is open)
- [ ] Typing indicator (Zone C above input bar)
  - Emit `typing:start` on first keypress in the input; `typing:stop` after 2s of idle
  - Debounce the `typing:stop` emit with a 2-second timer reset on every keypress
  - Show animated bouncing dots + "<Name> is typing…" when `typing:start` received
  - Hide immediately when `typing:stop` received or a new message arrives
  - Animate in/out smoothly (opacity + slight translateY)

### Done When

- Messages show correct tick state at every stage (pending → sent → delivered → read)
- Opening a chat marks all messages as read and updates the sender's ticks to blue
- Typing in the input field shows the indicator in the other user's chat within < 500ms
- Stopping typing for 2 seconds dismisses the indicator

---

## 8. Slice 6 — Presence System

**Goal:** Online/offline status is accurate and updates in real time across all open clients.

### Backend Tasks

- [ ] On socket `connect`: set `User.isOnline = true`; broadcast `presence:online` with `{ userId }` to all sockets (or to contacts only via room logic)
- [ ] On socket `disconnect`: set `User.isOnline = false`, `User.lastSeen = Date.now()`; broadcast `presence:offline` with `{ userId, lastSeen }`
- [ ] On `POST /api/auth/logout`: same offline update + socket disconnect (already in Slice 2 — verify it emits the presence event)

### Frontend Tasks

- [ ] Listen for `presence:online` and `presence:offline` socket events → update `User.isOnline` and `lastSeen` in Redux store for the relevant user
- [ ] Online dot on avatars in:
  - Sidebar chat list items (DMs only) — green `10px` dot, bottom-right of avatar
  - Chat header — on contact's avatar
  - Contact Info panel (Slice 7)
  - New DM search results
- [ ] Last seen text in DM chat header sub-line:
  - "Online" when `isOnline: true`
  - "Last seen today at 14:32" / "Last seen yesterday" / "Last seen Monday" / "Last seen DD MMM"
  - Use `date-fns` for all date formatting

### Done When

- Logging in on one tab shows a green dot on the other user's sidebar entry in another tab within ~1 second
- Logging out clears the green dot and shows "Last seen just now" (then updates to timestamp)

---

## 9. Slice 7 — Profile & Settings

**Goal:** Users can edit their name, status, phone, and avatar. Theme and sound preferences persist. Moved earlier than groups because it makes the demo feel complete and polished from the first minute.

### Backend Tasks

- [ ] `PATCH /api/users/me`
  - Zod validate: name (required), statusMessage (max 100), phone (E.164 optional), avatar (URL string)
  - Update only provided fields (partial update)
  - Return updated user object
- [ ] `POST /api/media/upload` — avatar upload path (shared with Slice 9 for message media)
  - Validate MIME type: `image/jpeg`, `image/png`, `image/gif`, `image/webp` only
  - Validate size: ≤ 10MB
  - Upload to Cloudinary via `cloudinary.uploader.upload`
  - Return `{ url, publicId }`

### Frontend Tasks

- [ ] `/profile` page — per `UIScreens.md` section 9
  - Avatar upload: click circle → file picker → upload to `POST /api/media/upload` → show circular progress ring → update preview → save URL in form state
  - Fields: Full Name (editable), Email (read-only, lock icon), Status Message (100-char counter), Phone (optional, hint text)
  - Save Changes button: disabled when no fields have changed (compare form state to original); spinner while saving; brief "✓ Saved" success state
  - Toast: "Profile updated." on success
- [ ] Preferences section
  - Theme toggle (Light/Dark): updates CSS class on `<html>`, persisted in `localStorage`; implement full dark mode token set from `UIScreens.md` section 1
  - Sound alerts toggle: persisted in `localStorage`
  - Notifications row: status chip ("Enabled" / "Disabled" / "Blocked"); "Enable" button triggers `Notification.requestPermission()`
- [ ] Danger zone: Logout button → calls `POST /api/auth/logout` → clears store → redirect to `/login`
- [ ] Contact Info slide-in panel — per `UIScreens.md` section 8
  - Shows contact's avatar, name, presence, email, phone (if set), status message
  - Shared Media section placeholder: "No shared media yet." (wires to Slice 9)
  - Triggered by clicking contact name/avatar in DM chat header

### Done When

- Changing name or avatar reflects immediately in the sidebar and chat header (update Redux store on save)
- Profile page fields pre-fill with current user data on load
- Dark mode toggles globally and persists across browser refresh
- Contact Info panel opens from the DM chat header

---

## 10. Slice 8 — Group Chats

**Goal:** Users can create group chats, exchange messages with multiple people, and manage group membership.

### Backend Tasks

- [ ] `POST /api/chats/group`
  - Validate: `name` required, `participants` array min 2 entries (plus creator = min 3 total)
  - Create `Chat` document: `isGroup: true`, `admin: req.userId`, `participants: [req.userId, ...participants]`
  - Return populated chat
- [ ] `PATCH /api/chats/:chatId/participants/add`
  - Admin-only middleware: verify `req.userId === chat.admin`
  - Add new user ID to `participants[]` (prevent duplicates)
  - Emit a system message socket event: "X was added to the group"
- [ ] `PATCH /api/chats/:chatId/participants/remove`
  - Admin-only middleware
  - Remove user ID from `participants[]`
  - Emit system message: "X was removed from the group"
- [ ] `PATCH /api/chats/:chatId/leave`
  - Remove `req.userId` from `participants[]`
  - If leaver is admin and others remain: transfer admin to the next participant
  - If no participants remain: delete the chat
  - Emit system message: "X left the group"
- [ ] Socket.io: `message:send` already handles groups — it broadcasts to all participants in the room; ensure all group members are in the correct Socket.io room

### Frontend Tasks

- [ ] New Group Chat modal (2-step) — per `UIScreens.md` section 6
  - Step 1: participant search (same debounced API call as DM search), selected participants as chips with × remove, "Next →" disabled until ≥ 2 selected
  - Step 2: group icon upload (optional, same upload endpoint), group name input, participants preview (avatar stack), "Create Group" button
  - Modal transitions between steps with slide animation
- [ ] Group chat header — per `UIScreens.md` section 4.4
  - Group icon or initials avatar, group name, member count sub-line
  - More options: "Group Info", "Exit Group"
- [ ] Group message bubbles — per `UIScreens.md` section 4.4
  - Sender name above incoming bubbles (deterministic colour from user ID hash)
  - `24px` sender avatar to the left of bubble; hidden for consecutive messages from same sender
- [ ] Group Info slide-in panel — per `UIScreens.md` section 7
  - Group icon (with edit overlay for admin), group name (editable inline for admin), member count, created date
  - Member list: avatar, name, "Admin" badge, "You" badge, online dot, remove button (admin only, hidden for self)
  - "Add Member" button (admin only)
  - "Leave Group" button → confirmation dialog
- [ ] System messages rendered as centered chip: "Alice joined", "Bob left", "Group created"

### Done When

- Create a group with 3 users → all 3 can send and receive messages in real time
- Admin can add and remove members from the Group Info panel
- Leaving a group removes it from the leaver's sidebar
- Sender names and avatars display correctly on incoming group messages

---

## 11. Slice 9 — Media Sharing

**Goal:** Users can send images in chat. Videos and PDFs follow after images are working.

**Priority order within this slice:** Images → Videos → PDFs. Ship images first; add video/PDF if time allows.

### Backend Tasks

- [ ] `POST /api/media/upload` (extend from Slice 7)
  - Accept all allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `video/mp4`, `video/webm`, `application/pdf`
  - Size limits: images/PDFs ≤ 10MB, videos ≤ 50MB
  - Upload to Cloudinary with correct `resource_type`: `image`, `video`, or `raw` (for PDF)
  - Save `Media` document to MongoDB
  - Return `{ mediaId, url, publicId, resourceType, mimeType, sizeBytes, originalName }`
- [ ] `POST /api/messages` (extend): accept `type: 'image' | 'video' | 'file'` with `mediaId`; validate that `media` is required when type is not `text`
- [ ] Socket.io `message:send`: same — the media ref is already part of the message document

### Frontend Tasks

- [ ] Attach button in input bar → opens native file picker with `accept` attribute set to allowed MIME types
- [ ] Media preview zone (above input bar) — per `UIScreens.md` section 4.3
  - Image: `64×64px` thumbnail, × remove button
  - Video: thumbnail with play overlay
  - PDF: file icon + filename + size
  - Upload progress bar: animates 0% → 100% during Cloudinary upload; "Uploading… 47%" text
  - Send button disabled during upload
- [ ] Media message bubbles
  - Image: inline thumbnail `max 240×240px`, lazy loaded via Intersection Observer; click opens lightbox
  - Video: thumbnail with play button overlay; click opens lightbox inline player
  - PDF/File: card bubble — file icon, filename, size, download button
  - Caption text below media if message has content
- [ ] Media lightbox — per `UIScreens.md` section 10
  - Full-screen overlay `rgba(0,0,0,0.92)`
  - Sender info top-left, download button top-right, close (×) top-right
  - Left/right navigation arrows between media in the conversation
  - Keyboard: `Escape` closes, `ArrowLeft`/`ArrowRight` navigates
- [ ] Sidebar last message preview: "[Image]", "[Video]", "[File]" for media messages
- [ ] Contact Info panel shared media section: show last 4 image thumbnails in horizontal scroll row (horizontal scroll, `64×64px` each); hook up the placeholder from Slice 7

### Done When

- Select an image → see preview with progress bar → send → image appears in chat bubble for both users
- Click the image → lightbox opens with download and navigation
- Sidebar shows "[Image]" as the last message preview
- PDF and video send correctly with their respective bubble styles

---

## 12. Slice 10 — Message Context Menu & Soft Delete

**Goal:** Right-clicking a message reveals a context menu with available actions. "Delete for me" works correctly.

### Backend Tasks

- [ ] `PATCH /api/messages/:id/delete-for-me`
  - Verify requesting user is a participant of the message's chat
  - Add `req.userId` to `Message.deletedFor[]`
  - If `deletedFor` now contains all participants → hard delete the document
  - Return `200`

### Frontend Tasks

- [ ] Context menu component — per `UIScreens.md` section 12
  - Trigger: right-click on desktop, `500ms` long-press on touch
  - Smart positioning: detect viewport edges, flip if needed
  - Dismiss: click outside or `Escape`
  - Items rendered conditionally:
    - "Delete for me" — always shown (danger colour)
    - "Copy Text" — text messages only; writes to clipboard
    - "Download" — media messages only; triggers anchor download
    - "Message Info" — outgoing messages only; shows delivery/read status detail
    - "Reply" and "Forward" — greyed out with "(coming soon)" tooltip
  - Divider above danger actions
- [ ] Delete confirmation dialog — per `UIScreens.md` section 13
  - "This message will be removed from your view only."
  - Cancel (ghost) / Delete for Me (danger filled) buttons
  - Spinner on Delete button while API call in progress
  - On success: remove message from Redux store for this user; toast "Message deleted."
- [ ] Message Info view
  - Opens as a small popover or bottom sheet listing each participant's delivery/read status with timestamp

### Done When

- Right-clicking a message bubble shows the context menu in the correct position
- "Delete for me" hides the message for the deleting user only; the other user still sees it
- "Copy Text" copies the message content to clipboard
- "Download" triggers a file download for media messages

---

## 13. Slice 11 — Polish, Hardening & Deployment

**Goal:** A production-ready, visually complete application deployed to Vercel with a live URL and demo seed data. This slice is the difference between a "student project" and a "portfolio project."

### Security Hardening

- [ ] Audit all API routes — every route has JWT middleware applied; no unintended public endpoints
- [ ] Audit all API routes — every input has a Zod schema; no `req.body` used directly without validation
- [ ] Verify rate limiting is active on `/api/auth/login`
- [ ] Verify `password` field has `select: false` and is never returned in any API response
- [ ] Verify chat membership is checked before any message read or write
- [ ] Verify CORS and `SameSite` cookie settings in `next.config.js`
- [ ] Verify file upload: MIME type + extension whitelist is enforced server-side (not just client-side)

### Skeleton Loading States

- [ ] Sidebar skeleton — 6 shimmer chat items on initial load
- [ ] Message list skeleton — 8–10 shimmer bubbles (alternating left/right) when chat first opens
- [ ] Profile page skeleton — avatar circle + field bars
- [ ] Shimmer animation: `linear-gradient` sweep, `1.5s` infinite, consistent across all skeletons
- [ ] Fade-in transition: `opacity 0→1` over `150ms` when real data arrives

### Empty States

- [ ] Chat list: "No chats yet. Start a conversation by searching for someone." + "New Chat" CTA button
- [ ] Message area (chat open, no messages): "No messages yet. Send a message to start the conversation."
- [ ] User search (no results): "No users found. Try a different name or email address."
- [ ] Shared media (none yet): "No shared media yet."

### Toast System

- [ ] Wire toasts to all success paths: "Profile updated.", "Group created.", "Message deleted.", "Changes saved."
- [ ] Wire toasts to all error paths: "Something went wrong. Please try again.", "Upload failed.", "Could not send message."
- [ ] Wire toasts to auth paths: "Session expired. Please log in." (on `401` mid-session)
- [ ] Wire toasts to rate limit: "Too many login attempts. Try again in X minutes."
- [ ] Stacking: max 3 visible, 4-second auto-dismiss with draining progress bar, × manual dismiss

### Dark Mode

- [ ] Implement all dark mode token values from `UIScreens.md` section 1 (Dark Mode column)
- [ ] Apply via `class="dark"` on `<html>` (Tailwind dark mode strategy: `class`)
- [ ] Verify every component looks correct in dark mode: sidebar, chat area, bubbles, modals, overlays, toasts, auth pages

### Mobile Responsiveness

- [ ] Mobile breakpoint (< 768px): sidebar is full-screen; right panel hidden until a chat is selected
- [ ] Chat selection on mobile: pushes to full-screen chat view (add browser history entry)
- [ ] Back button in chat header (mobile only): chevron-left, returns to sidebar
- [ ] Input bar: `env(safe-area-inset-bottom)` padding for notched phones
- [ ] New Group modal: full-screen bottom-sheet on mobile
- [ ] Group Info / Contact Info panels: full-screen on mobile
- [ ] Test on Chrome DevTools device emulation: iPhone 14, Pixel 7, iPad

### Deployment

- [ ] Create production MongoDB Atlas M0 cluster; set `MONGODB_URI` in Vercel Dashboard
- [ ] Create Cloudinary account; set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] Set `JWT_SECRET` (strong random string, min 32 chars) in Vercel Dashboard
- [ ] Set `NEXT_PUBLIC_APP_URL` in Vercel Dashboard
- [ ] Connect GitHub repo to Vercel; enable automatic deployments on `main` branch
- [ ] Set up GitHub Actions CI: `npm run build` + `npm run lint` on every PR
- [ ] Verify all environment variables are present in production (Vercel will warn on missing ones)
- [ ] Run `npm run build` locally before first deploy to catch type errors

### Demo Seed Data

- [ ] Write `scripts/seed.ts` — creates:
  - 3 demo users: `alice@demo.com`, `bob@demo.com`, `carol@demo.com` (all password: `Demo1234!`)
  - 1 DM between Alice and Bob with 15 messages and a shared image
  - 1 DM between Alice and Carol with 8 messages
  - 1 group chat "Design Team" with all 3 users and 20 messages
- [ ] Add `"seed": "ts-node scripts/seed.ts"` to `package.json` scripts
- [ ] Run seed script against production Atlas cluster before sharing the portfolio link
- [ ] Document demo credentials in `README.md`

### README

- [ ] Project overview and live demo link
- [ ] Architecture decisions section (explain: cursor pagination vs offset, `lastMessage` denormalization, JWT in HTTP-only cookie vs localStorage, Socket.io room strategy)
- [ ] Local development setup (env vars, `npm install`, `npm run dev`)
- [ ] Tech stack table
- [ ] Screenshots / GIF demo
- [ ] Phase 2 roadmap mention

### Done When

- App is live on a Vercel URL
- Demo credentials work and show a populated, active-looking app immediately
- All loading states, empty states, and error paths show correct UI
- App looks correct in dark mode
- App is usable on mobile (Chrome DevTools)
- `npm run build` passes with zero type errors

---

## 14. Parallel Tasks (Run Throughout)

These are not a separate slice. Do them continuously as you build each slice.

### Git Discipline
- Commit at the end of every backend task and every frontend task — not just at end of each slice
- Commit message format: `feat(slice-N): description` (e.g. `feat(slice-2): add login rate limiting`)
- Never commit broken code to `main` — use feature branches for anything experimental
- Push to GitHub daily

### Code Quality
- Run `npm run lint` before every commit
- Fix TypeScript errors immediately — do not use `any` unless genuinely unavoidable
- Keep API route handlers thin: validation in Zod schema, business logic in a `lib/services/` function, not inline in the route
- Use `try/catch` on every async operation with a meaningful error response

### Testing (Manual)
- After every backend task: test the endpoint with a REST client (Thunder Client, Postman, or curl) before wiring the frontend
- After every frontend task: test in both light and dark mode, and at mobile viewport width

---

## 15. Definition of Done

A slice is done when **all of the following are true**:

- [ ] All backend tasks in the slice are complete and tested via a REST client
- [ ] All frontend tasks in the slice are complete and wired to the real API (no mocked data)
- [ ] The happy path works end-to-end in the browser
- [ ] At least one error path is tested (e.g. invalid input, unauthorized access, network failure)
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] No console errors in the browser during normal use
- [ ] The feature looks correct in both light mode and dark mode
- [ ] The feature is usable at mobile viewport width (375px)
- [ ] Code is committed and pushed to GitHub

---

## 16. Folder Structure

```
/app
  /(auth)
    /login
      page.tsx
    /register
      page.tsx
  /(chat)
    /chat
      page.tsx
      layout.tsx
    /profile
      page.tsx
  /api
    /auth
      /register/route.ts
      /login/route.ts
      /logout/route.ts
    /users
      /me/route.ts
      /search/route.ts
    /chats
      /route.ts              ← GET (list) + POST (dm)
      /group/route.ts
      /[chatId]
        /participants
          /add/route.ts
          /remove/route.ts
        /leave/route.ts
    /messages
      /route.ts              ← GET (paginate) + POST (send)
      /[id]
        /delete-for-me/route.ts
    /media
      /upload/route.ts
  globals.css
  layout.tsx

/lib
  db.ts
  jwt.ts
  socket.ts                  ← client singleton
  env.ts
  /models
    User.ts
    Chat.ts
    Message.ts
    Media.ts
  /validations
    authSchemas.ts
    messageSchemas.ts
    chatSchemas.ts
    mediaSchemas.ts
  /services
    authService.ts
    chatService.ts
    messageService.ts
    mediaService.ts
  /socket
    server.ts                ← Socket.io server setup + event handlers
  cloudinary.ts

/store
  index.ts
  /slices
    authSlice.ts
    chatSlice.ts
    uiSlice.ts

/components
  /ui
    Avatar.tsx
    Spinner.tsx
    Toast.tsx
    IconButton.tsx
    Modal.tsx
    ContextMenu.tsx
    ConfirmDialog.tsx
    Skeleton.tsx
  /sidebar
    Sidebar.tsx
    SidebarHeader.tsx
    ChatListItem.tsx
    SearchBar.tsx
    NewDMOverlay.tsx
  /chat
    ChatHeader.tsx
    MessageArea.tsx
    MessageBubble.tsx
    MessageInput.tsx
    TypingIndicator.tsx
    DateSeparator.tsx
    NewMessageBanner.tsx
    MediaPreview.tsx
  /modals
    NewGroupModal.tsx
    GroupInfoPanel.tsx
    ContactInfoPanel.tsx
    MediaLightbox.tsx

/middleware.ts
/scripts
  seed.ts
```

---

## 17. Environment Variables

Create `.env.local` for development. Set all of these in Vercel Dashboard for production.

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/chatsphere

# JWT
JWT_SECRET=<strong-random-string-min-32-chars>
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Change to production URL on Vercel

# Rate Limiting (if using Upstash)
UPSTASH_REDIS_REST_URL=<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

Add `.env.local` to `.gitignore` — never commit secrets.

---

## 18. Full Timeline at a Glance

| Week | Slices | Milestone |
|---|---|---|
| Week 1 | 1, 2, 3 | Foundation set up, auth working, dashboard shell with user search |
| Week 2 | 4, 5, 6 | Real-time messaging working end-to-end, ticks, typing, presence |
| Week 3 | 7, 8 | Profile page, group chats fully working — **deploy to Vercel** |
| Week 4 | 9, 10 | Media sharing (images → video → PDF), context menu, soft delete |
| Week 5 | 11 | Full polish pass, dark mode, mobile, seed data, README, production deploy |

---

*ChatSphere Development Plan v1.0 · Solo · Portfolio · Vertical Slice · Next.js + MongoDB + Socket.io*
