import { ReactNode } from "react";

export default function ChatLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-[var(--color-bg-base)]">
            {/* Sidebar placeholder */}
            <div className="hidden md:flex flex-col w-[360px] bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]">
                Sidebar Shell
            </div>
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    );
}
