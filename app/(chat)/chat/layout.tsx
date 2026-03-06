"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ChatLayout({ children }: { children: ReactNode }) {
    const { activeChatId } = useSelector((state: RootState) => state.chat);

    return (
        <div className="flex w-full h-screen overflow-hidden bg-[var(--color-bg-base)]">
            {/* Sidebar Shell */}
            <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[360px] bg-[var(--color-bg-surface)] border-r border-[var(--color-border)] shrink-0`}>
                <Sidebar />
            </div>

            {/* Right Panel */}
            <div className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden relative`}>
                {children}
            </div>
        </div>
    );
}
