# 🔐 The Complete Guide to Implementing Auth0 (with Google & GitHub) in Next.js

Welcome! Since you haven't worked with Auth0 before, this guide is written entirely in **teaching mode**. We will walk through exactly what Auth0 is, how to configure it with Google and GitHub, and how to integrate it into your Next.js ChatSphere application while keeping your MongoDB database in sync.

---

## 📖 1. What is Auth0?

Currently, your ChatSphere application uses a "custom authentication" system. You manually hash passwords with `bcrypt`, manually generate JWTs, and handle email OTPs.

**Auth0** is an Identity-as-a-Service (IDaaS) platform. Instead of managing passwords and JWTs yourself, you outsource the entire login process to Auth0. 
- When a user clicks "Login", they are redirected to a secure Auth0-hosted page.
- The user logs in (via Email, Google, or GitHub).
- Auth0 redirects them back to your app with a secure Token.
- Your app reads this token to know who the user is.

Because "Auth0" sounds a lot like "OAuth", they are often confused. **OAuth** is the underlying protocol that makes social logins work. **Auth0** is the company/service that makes implementing OAuth incredibly easy.

---

## 🧐 2. Will my custom JWT Auth still work if I add OAuth?

If you are wondering whether you can keep your existing email/password JWT system while adding OAuth (Google/GitHub), the answer depends on how you implement it:

### Approach A: Using Auth0 (Replaces your auth)
If you follow this Auth0 guide, Auth0 is designed to **replace** your entire custom authentication system. Your existing `/api/auth/register` and `/api/auth/login` endpoints would be deleted. Auth0 will handle **both** email/password logins and Google/GitHub logins for you. It handles the JWTs, password hashing, and even email verification for you.

### Approach B: Using NextAuth.js (Keeps your custom auth)
If you specifically want to keep your **custom** JWT logic exactly as you built it in your PRD (with your own bcrypt and OTP code), but just want to add "Login with Google", you should **not** use Auth0. Instead, you should use **NextAuth.js (Auth.js)**. NextAuth allows you to keep a custom `CredentialsProvider` side-by-side with a `GoogleProvider` seamlessly.

*If you want to use NextAuth.js instead of Auth0 to keep your custom code, let me know and I will generate a NextAuth guide! But if you want to let Auth0 handle everything securely so you can delete your custom code, continue below:*

---

## ⚙️ 3. Setting Up the Auth0 Dashboard

Before we write code, we need to create an Auth0 Application.

### Step 2.1: Create your Auth0 Tenant
1. Go to [Auth0.com](https://auth0.com/) and sign up for a free account.
2. Create a "Tenant" (this is like a workspace for your app, e.g., `chatsphere.us.auth0.com`).

### Step 2.2: Create a Next.js Application in Auth0
1. In the Auth0 Dashboard, go to **Applications > Applications** on the left sidebar.
2. Click **Create Application**.
3. Name it `ChatSphere` and select **Regular Web Applications**.
4. Click **Create**.
5. Select **Next.js** as your technology.

### Step 2.3: Configure App URLs
Auth0 needs to know exactly which URLs are allowed to interact with it (to prevent hackers from hijacking your logins).
In your ChatSphere application settings in Auth0, scroll down to **Application URIs** and set:
- **Allowed Callback URLs:** `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs:** `http://localhost:3000/`
- **Allowed Web Origins:** `http://localhost:3000`

Scroll to the bottom and click **Save Changes**.

---

## 🌍 4. Configuring Google and GitHub Providers

By default, Auth0 enables Google login using *their* development keys. However, for a production app, you need your own keys.

### Setting up Google
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project called "ChatSphere Auth".
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Set Application type to **Web application**.
6. Under **Authorized redirect URIs**, you must paste the Auth0 callback URL. You can find this in your Auth0 Dashboard under **Authentication > Social > Google > Settings** (it will look like `https://YOUR_TENANT.auth0.com/login/callback`).
7. Once created, Google will give you a **Client ID** and **Client Secret**.
8. Go back to your Auth0 Dashboard > **Authentication > Social > Google**.
9. Paste in the Client ID and Client Secret, and click **Save**.

### Setting up GitHub
1. Go to your GitHub account settings: **Settings > Developer Settings > OAuth Apps**.
2. Click **New OAuth App**.
3. Application name: `ChatSphere`.
4. Homepage URL: `http://localhost:3000`.
5. Authorization callback URL: Again, get this from your Auth0 Dashboard > **Authentication > Social > GitHub** (e.g., `https://YOUR_TENANT.auth0.com/login/callback`).
6. Register the application to get your **Client ID** and **Client Secret**.
7. Go to Auth0 Dashboard > **Authentication > Social > GitHub**, paste the keys, and click **Save**.

---

## 💻 5. Coding the Next.js Integration

Now that the Auth0 dashboard is ready, let's wire it into ChatSphere. Auth0 provides a built-in Next.js SDK that makes this extremely easy.

### Step 4.1: Install the SDK
Run this command in your terminal:
```bash
npm install @auth0/nextjs-auth0
```

### Step 4.2: Set Environment Variables
Open your `.env.local` file and add the following keys. You can find the Auth0 Domain, Client ID, and Secret in your Auth0 Application Settings.

```env
# A long, secret value used to encrypt the session cookie. 
# Generate one by running this in your terminal: openssl rand -hex 32
AUTH0_SECRET='your_super_long_random_string_here'

# Your ChatSphere base URL
APP_BASE_URL='http://localhost:3000'

# Details from your Auth0 Application Dashboard
AUTH0_DOMAIN='YOUR_TENANT.auth0.com'
AUTH0_CLIENT_ID='YOUR_AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_AUTH0_CLIENT_SECRET'
```

### Step 4.3: Create Auth0 Middleware
In version 4 of the Auth0 SDK, the Next.js `middleware.ts` handles your Login, Logout, and Callbacks automatically, removing the need for a dedicated API route. We will also initialize the Auth0 Client in a shared file so we can customize it later for MongoDB.

First, create `lib/auth0.ts`:
```typescript
// lib/auth0.ts
import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();
```

Then, create or update `middleware.ts` in the root of your project:
```typescript
// middleware.ts
import { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

// Optionally configure matching paths:
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Step 4.4: Wrap your layout in the Auth0Provider
To let your entire app know if someone is logged in, you need to wrap the app in Auth0's Context Provider. In version 4, we use the `Auth0Provider` and pass it the session data obtained from the server.

Update your `app/layout.tsx`:

```tsx
// app/layout.tsx
import { Auth0Provider } from '@auth0/nextjs-auth0';
import { auth0 } from '@/lib/auth0';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth0.getSession();

  return (
    <html lang="en">
      <body>
        <Auth0Provider user={session?.user}>
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}
```

---

## 🗄 6. Syncing Auth0 with your MongoDB Database

Right now, ChatSphere's database (`users` collection) expects a password. With Auth0, users logging in via Google/GitHub **won't have a password**. 

Auth0 maintains its own user database, but because ChatSphere relies on MongoDB for chats and messages, we need to **copy** the Auth0 user into our MongoDB the first time they log in.

### Step 5.1: Update your Mongoose Schema
In your `lib/models/User.ts`, you need to make `password` optional, and perhaps add an `auth0Id` field.

```typescript
// lib/models/User.ts modification idea:
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  
  // Make password optional because Google/GitHub users don't have one!
  password: { type: String, select: false }, 
  
  // Track that this user logged in via Auth0
  auth0Id: { type: String, unique: true, sparse: true }, 
  
  // ... rest of your existing fields (name, avatar, etc.)
});
```

### Step 5.2: Syncing the User on Login
To safely save the user into MongoDB after Auth0 logs them in, we can customize the Auth0Client's `beforeSessionSaved` hook in `lib/auth0.ts`. This hook runs right before the session is persisted.

Modify your `lib/auth0.ts`:

```typescript
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import dbConnect from '@/lib/dbConnect'; // Your DB connection utility
import User from '@/lib/models/User';

export const auth0 = new Auth0Client({
  async beforeSessionSaved(session) {
    await dbConnect();

    const { user } = session; // This is the user object from Auth0

    // Check if they already exist in your DB
    let existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
      // If they don't exist, create a new record in MongoDB
      existingUser = await User.create({
        email: user.email,
        name: user.name || user.nickname || "ChatSphere User",
        avatar: user.picture || null,
        auth0Id: user.sub, // Auth0's unique ID for the user
      });
    }

    // Add your MongoDB User ID to the Auth0 session if needed
    return {
      ...session,
      user: {
        ...session.user,
        mongoId: existingUser._id.toString(),
      }
    };
  }
});
```

---

## 🎨 7. Updating the UI for Login/Logout

You don't need to build a custom login form anymore! Auth0 handles the UI. You just need a button to trigger the redirect.

### Logging In
In your Navbar or welcome page:
```tsx
<a href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded">
  Login or Sign Up
</a>
```

If you want to bypass the Auth0 prompt and go straight to Google or GitHub (like we did in the login page):
```tsx
<a href="/auth/login?connection=google-oauth2">Google Login</a>
<a href="/auth/login?connection=github">GitHub Login</a>
```

### Displaying the User & Logging Out
You can use the `useUser` hook in client components to read the Auth0 state.

```tsx
"use client";
import { useUser } from '@auth0/nextjs-auth0/client';

export default function ProfileWidget() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>Welcome, {user.name}!</h2>
        <a href="/auth/logout">Log Out</a>
      </div>
    );
  }

  return <a href="/auth/login">Please log in</a>;
}
```

---

## 🎉 8. Summary of What We Achieved

1. **Offloaded Security:** Instead of hashing passwords and handling JWT cookies manually, Auth0 handles all the cryptography and session cookies securely.
2. **Easy Social Login:** By linking your Google and GitHub Developer keys inside the Auth0 Dashboard, Auth0 gives you Social Login out-of-the-box.
3. **MongoDB Compatibility:** By intercepting the `beforeSessionSaved` in the `lib/auth0.ts` file, we ensure that every user seamlessly gets a record in your MongoDB `users` collection, keeping your chats and messages fully functional.

**Next Steps for you:**
- Try creating the Auth0 account and running through the steps.
- Let me know once you have your `.env.local` keys ready, and we can test it live!
