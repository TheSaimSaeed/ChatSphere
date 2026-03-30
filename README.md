# ChatSphere

ChatSphere is a modern, real-time web chat application built with Next.js (App Router), enabling seamless team and personal communication. It features a beautiful, responsive UI, real-time messaging, and a robust dual-authentication system.

## 🚀 Key Features

- **Real-Time Messaging**: Instant message delivery powered by `Socket.io` with REST API fallbacks.
- **Dual Authentication**: 
  - Custom JWT-based Email/Password authentication (with email verification via Nodemailer).
  - Social Logins (Google, GitHub) powered by `@auth0/nextjs-auth0` (v4 Edge Middleware).
  - Seamless unified bridge handling both OAuth and Custom sessions seamlessly.
- **Modern UI/UX**: Designed with Tailwind CSS, Framer Motion, and `shadcn/ui` components for a premium, responsive experience. Dark/Light mode support.
- **Media Uploads**: Integrated with Cloudinary for seamless image and file sharing.
- **Robust Security**: Protected API routes via Next.js Edge Middleware and rate limiting powered by Upstash Redis.
- **State Management**: Built heavily on Redux Toolkit for complex real-time unified application state tracking.

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Real-Time**: Socket.io
- **State Management**: Redux Toolkit & React Redux
- **Authentication**: Custom JWT + Auth0 V4 Edge SDK
- **Styling**: Tailwind CSS (v4) + Shadcn UI
- **Media**: Cloudinary
- **Rate Limiting**: Upstash Redis

---

## 💻 Getting Started

### Prerequisites
Make sure you have Node.js and `pnpm` (or npm/yarn) installed on your machine.

### 1. Clone the repository
```bash
git clone <repository-url>
cd chat-application
```

### 2. Install Dependencies
```bash
pnpm install
```


### 3. Start the Application
For local development, we use a custom initialization script (`server.ts`) to boot up both the Next.js server and the Socket.io instances simultaneously. 

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 4. Architecture Notes

### Unified Authentication Flow
ChatSphere manages a hybrid authentication architecture.
- **Custom Auth**: Handled organically through standard `/api/auth/login` paths, generating an encrypted HTTP-only `session.token`.
- **OAuth (Auth0)**: Managed by Next.js Edge Middleware natively.
- **Data Bridge**: To ensure systems like `Socket.io` work agnostically, Auth0 users are intercepted during their session by `withAuth` route wrappers, generating a synchronized DB user profile and unifying access rules across the platform.
- **Unified Logout**: `GET /api/logout` drops the local `session.token` and forces a hard redirect to the internal Next.js Auth0 `/auth/logout` API, correctly destroying IDP transaction cookies simultaneously without framework mapping anomalies.

### Real-Time Sockets
Because Next.js heavily scopes serverless architecture, `Socket.io` is booted from `server.ts` rather than organically attaching inside standard server actions.

---

## 🤝 Contribution
The project utilizes strict TypeScript compilation and ESLint. Please ensure all types match the explicit Mongoose schema definitions in `/lib/models` before opening PRs.
