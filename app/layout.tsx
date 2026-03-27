import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { SessionInit } from "@/components/auth/SessionInit";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Auth0Provider } from '@auth0/nextjs-auth0';
import { auth0 } from '@/lib/auth0';
// User sync logic is handled in Server Components/Routes to keep Middleware edge-compatible.

export const metadata: Metadata = {
  title: "ChatSphere",
  description: "Simple, fast, real-time messaging.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-(--chat-bg) text-slate-100 antialiased selection:bg-primary selection:text-black">
        <Auth0Provider user={session?.user}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <StoreProvider>
              <SessionInit>
                {children}
                <ToastContainer />
              </SessionInit>
            </StoreProvider>
          </ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
