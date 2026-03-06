import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ToastContainer } from "@/components/shared/ToastContainer";
import { SessionInit } from "@/components/auth/SessionInit";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatSphere",
  description: "Simple, fast, real-time messaging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[var(--chat-bg-base)] text-[var(--chat-text-primary)] antialiased selection:bg-[var(--chat-primary)] selection:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <StoreProvider>
            <SessionInit>
              {children}
              <ToastContainer />
            </SessionInit>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
