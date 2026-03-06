---
name: ChatSphere
description: Describe what this custom agent does and when to use it.
argument-hint: The inputs this agent expects, e.g., "a task to implement" or "a question to answer".
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->
# ChatSphere — Agent Skill

> This file is the authoritative instruction set for any AI coding agent working on the ChatSphere project.
> Read this file completely before writing a single line of code.
> Every decision you make must be traceable back to this file, the PRD, the plan, the features list, or the data models.

---

## Table of Contents

1. [Who You Are & What You Are Building](#1-who-you-are--what-you-are-building)
2. [Non-Negotiable Rules](#2-non-negotiable-rules)
3. [Tech Stack — Locked, No Substitutions](#3-tech-stack--locked-no-substitutions)
4. [MCP Servers & Design Tools](#4-mcp-servers--design-tools)
5. [Project File Map](#5-project-file-map)
6. [Architecture Principles](#6-architecture-principles)
7. [Folder Structure — Follow Exactly](#7-folder-structure--follow-exactly)
8. [How to Work Through the Plan](#8-how-to-work-through-the-plan)
9. [Slice Execution Protocol](#9-slice-execution-protocol)
10. [Backend Rules](#10-backend-rules)
11. [Frontend Rules](#11-frontend-rules)
12. [UI & Design Rules](#12-ui--design-rules)
13. [Animation Rules](#13-animation-rules)
14. [Real-Time / Socket.io Rules](#14-real-time--socketio-rules)
15. [Database & Data Model Rules](#15-database--data-model-rules)
16. [Code Quality Standards](#16-code-quality-standards)
17. [Logging Standards](#17-logging-standards)
18. [JSDoc Standards](#18-jsdoc-standards)
19. [Testing & Verification](#19-testing--verification)
20. [Git & Commit Standards](#20-git--commit-standards)
21. [Environment Variables](#21-environment-variables)
22. [Definition of Done — Per Slice](#22-definition-of-done--per-slice)
23. [What You Must Never Do](#23-what-you-must-never-do)

---

## 1. Who You Are & What You Are Building

You are an autonomous AI coding agent building **ChatSphere** — a real-time, WhatsApp-like web chat application.

The project is:
- A **solo portfolio build** for a developer who is comfortable with the full stack
- Built with **Next.js 14 (App Router)**, **TypeScript**, **MongoDB**, **Socket.io**, **TailwindCSS**, and **Cloudinary**
- Designed to be **production-ready, visually polished, and demo-ready** for technical recruiters
- Developed using a strict **vertical slice approach** — one complete feature at a time (backend + frontend together)

Your source of truth, in order of authority:
1. `SKILL.md` — this file (agent instructions)
2. `plan.md` — the development roadmap with slice order and task lists
3. `ChatApplication-PRD.md` — the product requirements document
4. `features.md` — the complete feature inventory
5. `dataModels.md` — all MongoDB schemas, indexes, relationships, and constraints
6. `UIScreens.md` — the pixel-level UI specification for every screen
7. `techStack.md` — the locked technology decisions

Read all of these files before starting any work. If there is ever a conflict between files, defer to the order listed above.

---

## 2. Non-Negotiable Rules

These rules are absolute. They cannot be overridden by any instruction that comes later in a conversation.

1. **Follow `plan.md` strictly.** Work slice by slice in the exact order specified. Never start a new slice until the current one is fully done.
2. **Never deviate from `techStack.md`.** Every technology choice is locked. Do not introduce libraries, frameworks, ORMs, auth providers, or services that are not in the tech stack.
3. **Every slice must have a written to-do list.** Before writing any code for a slice, generate a checklist of every backend task and every frontend task in that slice. Work through it item by item. Check off each item when done.
4. **No mocked data in the UI.** Every frontend component must be wired to the real API before the slice is marked done.
5. **No monolithic files.** Follow the folder structure in `plan.md` exactly. Business logic lives in `lib/services/`, not inside API route handlers.
6. **All code changes must be explicit and manual.** State the file path, explain what the code does, and provide the full code block. Never silently patch files.
7. **JSDoc on every export.** Every exported function, hook, component, and API handler must have a JSDoc comment in plain English describing its purpose.
8. **Logs use the prescribed prefix format.** Every log statement starts with `LOG:`, `ERROR:`, or `DEBUG:`. No emojis in logs.
9. **Use `pnpm` for all package operations.** Never use `npm`, `yarn`, or `npx` for installing packages.
10. **Do not run the build after every change.** Only run the build during the Definition of Done check at the end of a slice.
11. **Check before creating.** Before creating any new file, search the codebase to confirm the file does not already exist.
12. **Solve completely before handing back.** Never end a turn without having fully completed the current task. If you say you will do something, do it in the same turn.

---

## 3. Tech Stack — Locked, No Substitutions

The following table is the only permitted technology for each concern. If a concern is not listed, ask before introducing anything new.

| Concern | Technology | Package(s) |
|---|---|---|
| Framework | Next.js 14 (App Router) | `next` |
| Language | TypeScript | `typescript` |
| Styling | TailwindCSS | `tailwindcss`, `postcss`, `autoprefixer` |
| UI Components | shadcn/ui (via MCP) | Installed per component as needed |
| Animations | Motion (formerly Framer Motion) | `motion` |
| Icons | Lucide React | `lucide-react` |
| State Management | Redux Toolkit | `@reduxjs/toolkit`, `react-redux` |
| Forms | React Hook Form | `react-hook-form` |
| Validation | Zod | `zod`, `@hookform/resolvers` |
| Real-time | Socket.io | `socket.io`, `socket.io-client` |
| Auth | JWT | `jsonwebtoken`, `@types/jsonwebtoken` |
| Password Hashing | bcryptjs | `bcryptjs`, `@types/bcryptjs` |
| Database | MongoDB via Mongoose | `mongoose` |
| File Uploads | formidable | `formidable`, `@types/formidable` |
| Media Storage | Cloudinary | `cloudinary` |
| Rate Limiting | Upstash Ratelimit | `@upstash/ratelimit`, `@upstash/redis` |
| Utilities | date-fns, uuid, cookie | `date-fns`, `uuid`, `cookie`, `@types/uuid`, `@types/cookie` |
| Notifications | Web Push API (native browser) | No package needed |
| Hosting | Vercel | No package needed |
| CI/CD | GitHub Actions | No package needed |

**Installing packages:** Always use `pnpm add <package>` for runtime dependencies and `pnpm add -D <package>` for dev dependencies.

---

## 4. MCP Servers & Design Tools

The following MCP servers are connected and must be used for their designated purposes.

### shadcn/ui MCP Server
- **Purpose:** Install and configure shadcn/ui components
- **When to use:** Any time a UI primitive is needed — buttons, inputs, dialogs, dropdowns, tooltips, toasts, modals, sheets, cards, badges, avatars, progress bars, separators
- **How to use:** Always use the shadcn MCP server to install components instead of manually creating them. After installing a component via MCP, do not re-implement it from scratch
- **Customisation:** After installing a shadcn component, you may extend it with TailwindCSS classes to match the design tokens defined in `UIScreens.md` section 1
- **Never do:** Do not install shadcn components manually via the CLI without the MCP server. Do not create custom primitives when a shadcn component exists that covers the need

### Magic UI MCP Server
- **Purpose:** Install and use Magic UI animated components and effects
- **When to use:** For visually impressive micro-interactions — shimmer effects on skeleton loaders, animated counters, spotlight effects, animated gradient backgrounds, beam effects, dock components, and any other Motion-powered effects that Magic UI provides
- **How to use:** Use the Magic UI MCP server to pull in components. Integrate them by wrapping or replacing standard shadcn components where appropriate
- **Good uses in this project:** Skeleton shimmer animations (Slice 11), notification badges, typing indicator animation, message arrival animations, online/offline presence transitions

### Stitch MCP Server
- **Purpose:** it is mandatory to Access the Stitch design tool where the UI screens for ChatSphere have been designed
- **When to use:** Every time you are building a frontend component or page. Always query Stitch first to see the exact design for that screen before writing any UI code
- **How to use:** Use the Stitch MCP server to fetch the current screen design, inspect spacing, colours, typography, and component layout. The Stitch designs are the visual source of truth for the frontend — they take precedence over written descriptions in `UIScreens.md` when there is a discrepancy
- **What to look for:** Component placement, spacing values, colour tokens, font sizes, border radii, shadow levels, and interaction states (hover, active, disabled, loading)

**MCP Usage Order for Any Frontend Task:**
1. Fetch the relevant screen from Stitch MCP to see the exact design
2. Install any needed shadcn/ui primitives via the shadcn MCP server
3. Install any Magic UI components via the Magic UI MCP server if animations are needed
4. Implement the component using TailwindCSS, the design tokens, and the Motion library

---

## 5. Project File Map

These are the authoritative reference files. Read them in full before starting any work. Never contradict them.

| File | What It Contains | When to Consult It |
|---|---|---|
| `ChatApplication-PRD.md` | Full product requirements, auth flow, API surface, security requirements, performance targets | Whenever you are implementing a feature and need to understand the expected behaviour |
| `plan.md` | Slice-by-slice development plan, task checklists, done criteria, folder structure, env vars, timeline | Before starting any slice — this is your work order |
| `features.md` | Complete feature inventory with every detail per feature | When implementing any feature to ensure nothing is missed |
| `dataModels.md` | All 4 Mongoose schemas, every field, every index, all relationships, all constraints | Before writing any DB query, model, or migration |
| `UIScreens.md` | Every screen's layout, components, element positions, states, interactions, design tokens | Before building any UI component or page |
| `techStack.md` | The locked technology choices | Before installing any package or making any architectural decision |

---

## 6. Architecture Principles

### No Monolithic Files
API route handlers must be thin. The pattern is:
```
Route Handler → validates input with Zod → calls service function → returns response
```
All business logic lives in `lib/services/`. A route handler should never be more than ~40 lines.

### Single Source of Truth
- **Types:** Define all shared TypeScript types in `lib/types/`. Import from there everywhere. Never duplicate type definitions.
- **Validation schemas:** All Zod schemas live in `lib/validations/`. API routes and frontend forms import from the same schema file.
- **Design tokens:** All CSS custom properties are defined once in `app/globals.css`. Never hardcode colour values or spacing in component files.
- **Socket events:** All Socket.io event names are defined as string constants in `lib/socket/events.ts`. Never use raw string literals for event names.

### Service Layer Pattern
Every major domain has a service file:
- `lib/services/authService.ts` — registration, login, JWT operations
- `lib/services/chatService.ts` — DM creation, group creation, participant management
- `lib/services/messageService.ts` — send, paginate, soft delete, status updates
- `lib/services/mediaService.ts` — Cloudinary upload, validation, metadata save
- `lib/services/userService.ts` — search, profile update, presence

Service functions are pure async functions that take typed inputs and return typed outputs. They throw typed errors that route handlers catch and convert to HTTP responses.

### Redux Store Shape
```ts
{
  auth: {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean
  },
  chat: {
    chats: Chat[],
    activeChatId: string | null,
    messagesByChatId: Record<string, Message[]>,
    typingByChatId: Record<string, string[]>   // array of user names typing
  },
  ui: {
    theme: 'light' | 'dark',
    soundEnabled: boolean,
    notificationsEnabled: boolean,
    toasts: Toast[]
  }
}
```

---

## 7. Folder Structure — Follow Exactly

```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(chat)
    /chat/page.tsx
    /chat/layout.tsx
    /profile/page.tsx
  /api
    /auth
      /register/route.ts
      /login/route.ts
      /logout/route.ts
    /users
      /me/route.ts
      /search/route.ts
    /chats
      /route.ts                       ← GET list + POST dm
      /group/route.ts
      /[chatId]/participants/add/route.ts
      /[chatId]/participants/remove/route.ts
      /[chatId]/leave/route.ts
    /messages
      /route.ts                       ← GET paginate + POST send
      /[id]/delete-for-me/route.ts
    /media/upload/route.ts
  globals.css
  layout.tsx

/lib
  db.ts
  jwt.ts
  env.ts
  cloudinary.ts
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
    userService.ts
  /socket
    client.ts                         ← Socket.io client singleton
    server.ts                         ← Socket.io server setup + all event handlers
    events.ts                         ← All event name constants
  /types
    index.ts                          ← All shared TypeScript interfaces and types
  /middleware
    withAuth.ts                       ← JWT verification wrapper for API routes

/store
  index.ts
  /slices
    authSlice.ts
    chatSlice.ts
    uiSlice.ts

/components
  /ui                                 ← shadcn/ui components (installed via MCP)
  /shared
    Avatar.tsx
    Spinner.tsx
    Skeleton.tsx
    ConfirmDialog.tsx
  /sidebar
    Sidebar.tsx
    SidebarHeader.tsx
    ChatListItem.tsx
    ChatSearchBar.tsx
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
    MediaLightbox.tsx
  /modals
    NewGroupModal.tsx
    GroupInfoPanel.tsx
    ContactInfoPanel.tsx
  /profile
    ProfileForm.tsx
    AvatarUpload.tsx

/middleware.ts                         ← Next.js route protection middleware

/scripts
  seed.ts
```

If a file already exists, never recreate it. If a file does not exist, create it in exactly the location above.

---

## 8. How to Work Through the Plan

### Before You Start Any Slice

1. Read the relevant slice section in `plan.md` completely
2. Read the relevant features in `features.md` for that slice
3. Check `dataModels.md` for any schemas or queries you will need
4. Check `UIScreens.md` for every screen involved in the slice
5. Fetch the relevant screen(s) from the **Stitch MCP server** to see the exact designs
6. Generate a complete to-do list for the slice (see format below)

### To-Do List Format

Every slice starts with a to-do list in this exact format. Display it to the user before writing any code, and update it (checking off completed items) as you work through it.

```markdown
## Slice N — [Slice Name] To-Do List

### Backend
- [ ] Task description
- [ ] Task description

### Frontend
- [ ] Task description
- [ ] Task description

### Integration & Verification
- [ ] Wire frontend to real API (no mocks)
- [ ] Test happy path end-to-end
- [ ] Test at least one error path
- [ ] Verify light mode + dark mode
- [ ] Verify mobile viewport (375px)
- [ ] `pnpm build` passes with zero TypeScript errors
- [ ] No console errors during normal use
- [ ] Commit and push to GitHub
```

Check off each item with `[x]` as you complete it. Never move to the next slice until every checkbox is ticked.

### Slice Execution Order

Follow this exact order from `plan.md`. Do not reorder, skip, or merge slices.

| # | Slice | Key Deliverable |
|---|---|---|
| 1 | Project Foundation | Running app, all models, JWT, Zod, Redux scaffold |
| 2 | Authentication | Register, login, logout, JWT sessions, auth pages |
| 3 | Chat Layout & User Search | Dashboard shell, sidebar, New DM overlay |
| 4 | Real-Time 1-to-1 Messaging | Socket.io messaging, optimistic UI, pagination |
| 5 | Message States & Typing | Tick icons, read receipts, typing indicator |
| 6 | Presence System | Online/offline dots, last seen timestamps |
| 7 | Profile & Settings | Profile page, avatar upload, theme toggle |
| 8 | Group Chats | Group creation, admin controls, group UI |
| 9 | Media Sharing | Image/video/PDF upload, lightbox, previews |
| 10 | Context Menu & Soft Delete | Right-click menu, delete for me |
| 11 | Polish, Hardening & Deployment | Skeletons, empty states, toasts, dark mode, mobile, deploy |

---

## 9. Slice Execution Protocol

For every slice, follow this exact sequence of steps. Do not skip steps.

**Step 1 — Read.** Read the slice section in `plan.md`, the relevant features in `features.md`, the relevant schemas in `dataModels.md`, and the relevant screens in `UIScreens.md`.

**Step 2 — Design.** Fetch all relevant screens from the Stitch MCP server. Note exact colours, spacing, and component behaviour.

**Step 3 — Plan.** Generate the to-do list. Show it to the user.

**Step 4 — Build backend first (within the slice).** For each backend task: write the Zod schema, write the service function, write the route handler, test the endpoint with a REST client or curl before wiring the frontend.

**Step 5 — Build frontend.** For each frontend task: install any needed shadcn components via MCP, install any needed Magic UI components via MCP, implement the component using TailwindCSS + Motion, wire it to the real API.

**Step 6 — Integrate.** Connect the Socket.io events if the slice involves real-time. Verify the Redux store updates correctly.

**Step 7 — Verify.** Run through the Definition of Done checklist for the slice. Fix anything that fails before declaring the slice done.

**Step 8 — Commit.** Stage and commit with the format `feat(slice-N): description`.

---

## 10. Backend Rules

### API Route Handler Pattern
Every API route must follow this pattern. No exceptions.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { mySchema } from '@/lib/validations/mySchemas';
import { myServiceFunction } from '@/lib/services/myService';

/** Handles [describe what this route does in plain English]. */
export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const parsed = mySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await myServiceFunction(userId, parsed.data);
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('ERROR: [route description] failed', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
});
```

### Validation Rules
- Every API route must validate its input with a Zod schema before doing anything else
- Zod schemas live in `lib/validations/` — one file per domain
- Never access `req.body` or `req.json()` without immediately parsing it through a Zod schema
- Return `400` with the Zod error object on validation failure
- Return `401` with a generic message on auth failure — never reveal whether the email or password was wrong
- Return `409` for uniqueness conflicts (duplicate email)
- Return `403` for authorization failures (e.g. non-admin trying to remove a member)
- Return `500` for unexpected errors — always log the original error server-side

### Service Function Rules
- Service functions must be pure async functions: they receive typed inputs, return typed outputs, and throw typed errors
- Never call `NextResponse` inside a service function — that belongs in the route handler
- Never import anything from `next/server` inside a service file
- Always connect to MongoDB at the top of the service call via `connectDB()` from `lib/db.ts`
- Always use Mongoose model methods — never raw MongoDB driver calls

### Authentication Middleware
- Use `withAuth` from `lib/middleware/withAuth.ts` to wrap all protected route handlers
- `withAuth` extracts the JWT from the HTTP-only cookie, verifies it, and passes `userId` as the second argument to the handler
- If the JWT is missing or invalid, `withAuth` returns `401` before calling the handler
- Never manually verify JWTs inside route handlers

### Rate Limiting
- Apply rate limiting to `/api/auth/login` only in MVP
- Use `@upstash/ratelimit` with a sliding window: 10 requests per 15 minutes per IP
- Return `429` with the message "Too many login attempts. Try again in X minutes."

---

## 11. Frontend Rules

### Data Fetching
- Use `fetch` with the native Next.js cache for initial server-side data where appropriate
- For client-side data fetching (chat list, messages), call the API routes directly from client components
- Never use `useEffect` + `fetch` chains that depend on each other — use Redux Thunks for async operations that update global state
- Always handle loading, error, and empty states for every data fetch

### Redux Usage
- All global state lives in Redux — auth, chat list, active messages, typing indicators, presence, UI preferences
- Local UI state (open/closed modals, hover states, form state) stays in local `useState`
- Never store derived data in Redux — compute it on the fly with selectors
- Use `createAsyncThunk` for all API calls that update Redux state
- Dispatch presence updates and message updates from Socket.io event listeners registered in a top-level `useEffect` in the chat layout

### Socket.io Client
- The Socket.io client singleton lives in `lib/socket/client.ts`
- It is initialised exactly once when the user logs in and disconnected on logout
- Import the singleton from `lib/socket/client.ts` wherever you need it — never create new socket instances
- All event listeners must be registered and cleaned up properly to avoid memory leaks

### Form Handling
- Use React Hook Form for every form in the application
- Connect Zod schemas to React Hook Form via `@hookform/resolvers/zod`
- Always show inline field-level errors (not just form-level toasts) for validation failures
- Disable the submit button and show a spinner while a form submission is in flight

---

## 12. UI & Design Rules

### Design Tokens
These CSS custom properties are defined in `app/globals.css` and must be used everywhere. Never hardcode colour values.

**Light Mode Tokens:**
```css
--color-bg-base: #F0F2F5;
--color-bg-surface: #FFFFFF;
--color-bg-chat: #E5DDD5;
--color-bubble-outgoing: #DCF8C6;
--color-bubble-incoming: #FFFFFF;
--color-primary: #25D366;
--color-primary-dark: #1EBE58;
--color-header: #075E54;
--color-text-primary: #111B21;
--color-text-secondary: #667781;
--color-text-on-header: #FFFFFF;
--color-border: #E9EDEF;
--color-tick-grey: #667781;
--color-tick-blue: #53BDEB;
--color-online: #25D366;
--color-danger: #EB4034;
--color-info: #3B82F6;
```

**Dark Mode Tokens (applied via `dark` class on `<html>`):**
```css
.dark {
  --color-bg-base: #111B21;
  --color-bg-surface: #1F2C34;
  --color-bg-chat: #0B141A;
  --color-bubble-outgoing: #005C4B;
  --color-bubble-incoming: #1F2C34;
  --color-text-primary: #E9EDEF;
  --color-text-secondary: #8696A0;
  --color-header: #1F2C34;
  --color-border: #2A3942;
}
```

**Typography Tokens:**
```css
--text-xs: 11px;
--text-sm: 13px;
--text-base: 15px;
--text-md: 15px / 600;
--text-lg: 17px / 600;
--text-xl: 20px / 700;
```

**Font family:** `Inter`, `Segoe UI`, `Helvetica Neue`, `sans-serif`

### shadcn/ui Component Usage
- Install shadcn components via the shadcn MCP server — never copy-paste component code manually
- After installation, customise with TailwindCSS utility classes only — never modify the component's internal structure
- Use shadcn's `Button`, `Input`, `Textarea`, `Dialog`, `DropdownMenu`, `Sheet`, `Toast`, `Badge`, `Avatar`, `Progress`, `Separator`, `Tooltip` for all respective UI needs

### Avatar Component Rules
- Shape: always a circle (`rounded-full`)
- Sizes: `w-8 h-8` (32px) for sidebar, `w-10 h-10` (40px) for chat header, `w-14 h-14` (56px) for profile/group info
- Fallback: when no avatar image, show a coloured circle with the user's initials. Generate the background colour deterministically from the user's `_id` (hash the ID to one of 8–10 preset colours)
- Online dot: `w-2.5 h-2.5` green circle, positioned `bottom-0 right-0` of the avatar container, with `ring-2 ring-white`

### Message Bubble Rules
- Outgoing (sent by current user): right-aligned, `--color-bubble-outgoing` background, `rounded-[7.5px] rounded-br-none` (flat bottom-right corner)
- Incoming: left-aligned, `--color-bubble-incoming` background, `rounded-[7.5px] rounded-bl-none` (flat bottom-left corner)
- Max width: `max-w-[65%]` of the chat panel
- Consecutive messages from the same sender: `mb-0.5`; sender change: `mb-2`
- Timestamp: `text-[11px]` inside the bubble, bottom-right

### Responsive Breakpoints
- Mobile: `< 768px` — sidebar is full screen, right panel hidden
- Tablet: `768px–1023px` — two columns, sidebar `280px`
- Desktop: `≥ 1024px` — two columns, sidebar `360px`

Always implement mobile first. Test at 375px viewport width.

---

## 13. Animation Rules

### Motion Library
The project uses the **Motion** library (the new name for Framer Motion). Always import from `motion/react`:

```ts
import { motion, AnimatePresence } from 'motion/react';
```

### When to Use Animations
Apply animations purposefully. Every animation must serve a functional or experiential reason — not decoration for its own sake.

| Element | Animation Type | Specification |
|---|---|---|
| Message bubble appear | Fade + slide up | `opacity: 0→1`, `y: 8→0`, `duration: 0.1` |
| Sidebar panel slide-in | Slide from left | `x: -100%→0`, `duration: 0.2`, `ease: easeOut` |
| Info panel slide-in (right) | Slide from right | `x: 100%→0`, `duration: 0.2`, `ease: easeOut` |
| Modal enter | Scale + fade | `scale: 0.95→1`, `opacity: 0→1`, `duration: 0.15`, `ease: easeOut` |
| Toast slide-in | Slide down + fade | `y: -8→0`, `opacity: 0→1`, `duration: 0.2` |
| Typing indicator dots | Bounce | Staggered `y` animation, 3 dots, `duration: 0.4`, `repeat: Infinity` |
| Skeleton shimmer | Use Magic UI shimmer component | Do not manually implement |
| Online dot appear | Scale | `scale: 0→1`, `duration: 0.15` |

### AnimatePresence
Wrap any element that conditionally mounts/unmounts in `<AnimatePresence>`. This is required for exit animations to work. Always include an `exit` prop on the `motion` element inside.

```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {/* content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Skeleton Loading States
Use Magic UI's shimmer/skeleton component (installed via MCP). Apply it to:
- 6 chat list items in the sidebar on initial load
- 8–10 message bubbles when a chat first opens
- Avatar circle + field bars on the profile page
- All skeleton elements must use the same shimmer animation style for visual consistency

---

## 14. Real-Time / Socket.io Rules

### Event Name Constants
All Socket.io event names are defined in `lib/socket/events.ts` as string constants. Never use raw string literals.

```ts
export const SOCKET_EVENTS = {
  // Client → Server
  MESSAGE_SEND: 'message:send',
  MESSAGE_READ: 'message:read',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Server → Client
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_DELIVERED: 'message:delivered',
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
} as const;
```

### Client-Side Socket Rules
- The socket client singleton in `lib/socket/client.ts` is initialised once after login and destroyed on logout
- Register all event listeners in the chat layout's `useEffect`. Clean up all listeners in the `useEffect` return function
- Never register socket event listeners inside individual components — they all belong in the top-level layout effect
- Dispatch Redux actions from socket event callbacks, never call `setState` directly

### Server-Side Socket Rules
- The Socket.io server is set up in `lib/socket/server.ts`
- Verify the JWT on every new `connection` event — disconnect if invalid
- On `message:send`: validate the sender is a participant, save to DB, update `Chat.lastMessage`, emit `message:receive` to the room, emit `message:delivered` back to sender
- On `message:read`: add `userId` to `readBy[]` for all unread messages in the chat, emit `message:read` back to sender
- On `disconnect`: set `isOnline: false`, update `lastSeen`, emit `presence:offline`
- Join each socket to a room named after `chatId` when the user opens a chat

### Typing Indicator Rules
- Client emits `typing:start` on first keypress
- Client emits `typing:stop` after 2 seconds of idle (debounced with a timer that resets on each keypress)
- Server relays both events to all other room members — no DB writes
- UI shows animated dots with the name: `"<Name> is typing…"`. In groups: `"Alice and Bob are typing…"` or `"3 people are typing…"`

---

## 15. Database & Data Model Rules

### Schema Reference
All schemas are defined in `dataModels.md`. Never deviate from them. Key points:

**User:**
- `email`: unique, required, lowercase, trimmed — primary identity
- `password`: bcrypt hashed, `select: false` — never returned to client
- `phone`: optional plain string, not verified, no unique constraint in MVP

**Chat:**
- `isGroup: false` = DM (exactly 2 participants)
- `isGroup: true` = group (3+ participants, `name` required, `admin` set to creator)
- `lastMessage` is a denormalized snapshot — updated on every new message save

**Message:**
- `status.deliveredTo[]` and `status.readBy[]` are arrays of User `_id` refs
- `deletedFor[]` is an array of User `_id` refs — soft delete per user
- `replyTo` exists in schema but is `null` in MVP

**Media:**
- Stores only Cloudinary metadata — never stores binary data

### Index Rules
Apply every index exactly as specified in `dataModels.md`. Never add indexes that are not listed there without a documented reason.

### Query Rules
- Always use Mongoose model methods — never the raw MongoDB Node driver
- Always use cursor-based pagination (`_id < before`) for message queries — never `skip`/`offset`
- Always check that the requesting user is a participant of the chat before any message read or write
- Always use `select('-password')` or rely on `select: false` — never return a password hash to a client
- For DM deduplication: `Chat.findOne({ isGroup: false, participants: { $all: [A, B], $size: 2 } })`

### Connection Management
- Use connection caching in `lib/db.ts` to avoid creating multiple connections during Next.js hot reload
- Call `connectDB()` at the top of every service function that touches MongoDB

---

## 16. Code Quality Standards

### TypeScript
- Strict mode is on — no `any` types unless absolutely unavoidable and commented with an explanation
- All function parameters and return types must be explicitly typed
- All Mongoose model types must be declared as interfaces in `lib/types/index.ts` and used consistently
- Never use `as unknown as X` casts — fix the type correctly instead

### Function Size
- No function should exceed 50 lines. If it does, extract a helper
- No component should exceed 150 lines. If it does, extract sub-components
- No file should exceed 300 lines. If it does, split it

### Error Handling
- Every `async`/`await` call must be wrapped in `try/catch`
- Service functions throw descriptive Error objects with a `.statusCode` property when appropriate
- Route handlers catch these errors and convert them to the correct HTTP status
- Never swallow errors silently

### Import Order
Keep imports in this order, separated by blank lines:
1. Node built-ins
2. External packages
3. Next.js / React internals
4. Internal `@/lib/` imports
5. Internal `@/components/` imports
6. Internal `@/store/` imports
7. Relative imports

---

## 17. Logging Standards

Every log statement must follow this format. No emojis. No decorative characters.

```ts
// General informational logs
console.log('LOG: [context] message', optionalData);

// Error logs
console.error('ERROR: [context] message', error);

// Debug logs (for development tracing, should not appear in production)
console.debug('DEBUG: [context] message', optionalData);
```

Examples:
```ts
console.log('LOG: [authService] user registered successfully', { userId: user._id });
console.error('ERROR: [messageService] failed to save message', error);
console.log('LOG: [socket:server] client connected', { userId, socketId: socket.id });
console.log('LOG: [socket:server] message:send received', { chatId, senderId: userId });
console.error('ERROR: [mediaService] cloudinary upload failed', error);
console.log('LOG: [authService] login rate limit exceeded', { ip });
console.debug('DEBUG: [chatSlice] messages appended', { chatId, count: messages.length });
```

---

## 18. JSDoc Standards

Every exported function, hook, component, and API handler must have a JSDoc comment. The comment must:
- Be written in plain English
- Describe what the thing does, not how it does it
- Not describe parameters or return values (no `@param`, no `@returns`)
- Not use technical jargon
- Be one to three sentences maximum

**Good examples:**
```ts
/** Registers a new user account and issues a session cookie on success. */
export async function registerUser(...) {}

/** Shows the currently active chat conversation with real-time message updates. */
export default function MessageArea() {}

/** Holds the global state for the currently logged-in user and their session. */
export const authSlice = createSlice(...);

/** Connects to the Socket.io server and exposes the shared connection for the app. */
export const socket = io(...);

/** Validates that a phone number follows the international E.164 format. */
export const phoneSchema = z.string()...;
```

**Bad examples (do not write these):**
```ts
/** @param email - The user's email address @returns Promise<User> */
/** Takes email and password, hashes the password using bcrypt with 10 salt rounds... */
/** This function is responsible for... */
```

---

## 19. Testing & Verification

### Manual Testing Protocol
After every backend task, test the endpoint before touching the frontend:
- Use a REST client (Thunder Client in VS Code, or `curl`)
- Test the happy path (valid inputs, authenticated user)
- Test at least one error path (invalid input, wrong credentials, missing auth)
- Log the response and confirm it matches the expected shape

After every frontend task:
- Verify the component renders correctly in light mode
- Verify the component renders correctly in dark mode
- Verify the component is usable at 375px (mobile) viewport width
- Verify no console errors appear during normal interaction

### End-of-Slice Verification
Before marking a slice done, verify every item in the Definition of Done checklist (section 22).

### Socket.io Testing
Test real-time features by opening two browser tabs logged in as different demo users. Verify:
- Messages sent in Tab A appear in Tab B within < 500ms
- Typing indicators appear and disappear correctly
- Presence dots update when a user logs in or out

### Build Check
Run `pnpm build` only at the end of a slice. It must pass with zero TypeScript errors and zero warnings. Fix every error before proceeding to the next slice.

---

## 20. Git & Commit Standards

### Commit Message Format
```
feat(slice-N): short description of what was built

Examples:
feat(slice-1): add mongoose connection with caching
feat(slice-2): add login rate limiting with upstash
feat(slice-4): implement cursor-based message pagination
fix(slice-4): correct optimistic message id collision on retry
chore(slice-11): add demo seed script
```

### Branching
- All work goes on `main` directly for this solo project unless experimenting with something risky
- For experimental work: create a branch `feat/slice-N-description`, merge to `main` when done

### What to Stage and Commit
- Stage all changed files related to the completed task
- Never stage `.env.local` or any file containing secrets
- Always include `.env.local` in `.gitignore`
- Push to GitHub after every slice completes

---

## 21. Environment Variables

Create `.env.local` in the project root if it does not exist. This file is never committed to git.

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/chatsphere

# JWT
JWT_SECRET=<strong-random-string-minimum-32-characters>
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

All environment variables are validated at startup using Zod in `lib/env.ts`. If any required variable is missing, the app throws an error on startup with a clear message identifying which variable is missing.

For production, all variables are set in the Vercel Dashboard. Never set production secrets in `.env.local`.

---

## 22. Definition of Done — Per Slice

A slice is only done when every single item in this checklist is true. Do not declare a slice done if any item is unchecked.

- [ ] Every backend task in the slice is implemented and manually tested
- [ ] Every frontend task in the slice is implemented
- [ ] Every frontend component is wired to the real API — no hardcoded mock data anywhere
- [ ] The happy path works end-to-end in a real browser
- [ ] At least one error path has been tested (invalid input, network failure, unauthorized access)
- [ ] All new exported functions, hooks, components, and API handlers have JSDoc comments
- [ ] All log statements use the `LOG:` / `ERROR:` / `DEBUG:` prefix format
- [ ] The feature looks and works correctly in **light mode**
- [ ] The feature looks and works correctly in **dark mode**
- [ ] The feature is usable and accessible at **375px mobile viewport width**
- [ ] `pnpm build` passes with zero TypeScript errors and zero warnings
- [ ] No unexpected `console.error` or `console.warn` messages appear during normal use
- [ ] All new files are in the correct location per the folder structure
- [ ] All changes are committed and pushed to GitHub with a properly formatted commit message

---

## 23. What You Must Never Do

These are hard prohibitions. If you find yourself about to do any of these, stop and re-read this file.

- **Never introduce a technology not in `techStack.md`** — no Prisma, no Drizzle, no Supabase, no Firebase, no Auth0, no Clerk, no tRPC, no GraphQL, no SWR, no React Query, no Axios
- **Never use `npm` or `yarn` or `npx`** — always use `pnpm`
- **Never use `localStorage` for the JWT** — it must be an HTTP-only cookie
- **Never return the password hash to a client** — ever, in any endpoint
- **Never use `skip`/`offset` for message pagination** — always cursor-based
- **Never embed messages inside the Chat document** — messages are always in the `messages` collection
- **Never write business logic inside a route handler** — it belongs in `lib/services/`
- **Never hardcode event name strings for Socket.io** — always use `SOCKET_EVENTS` constants
- **Never run `pnpm build` after every single file change** — only at end-of-slice verification
- **Never create a file that already exists** — check first
- **Never skip the Stitch MCP server consultation** before building a UI component
- **Never use `any` as a TypeScript type** without a written comment explaining why it's unavoidable
- **Never commit `.env.local` or any secrets** to the repository
- **Never declare a slice done with unchecked items** in the Definition of Done
- **Never end your turn** without having fully completed the current task

---

*ChatSphere SKILL.md v1.0 · Solo Portfolio Build · Vertical Slice · Next.js 14 + MongoDB + Socket.io*
*Last updated: aligned with plan.md v1.0, features.md v1.0, dataModels.md v1.0, UIScreens.md v1.0*
