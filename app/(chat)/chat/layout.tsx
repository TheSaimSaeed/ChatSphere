"use client";

import { ReactNode } from "react";
import NarrowSidebar from "@/components/sidebar/NarrowSidebar";
import Sidebar from "@/components/sidebar/Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function ChatLayout({ children }: { children: ReactNode }) {
    const { activeChatId } = useSelector((state: RootState) => state.chat);

    return (
        <div className="flex w-full h-screen overflow-hidden bg-(--color-bg-base)">
            {/* Narrow Sidebar */}
            <NarrowSidebar />

            {/* Wide Sidebar */}
            <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-(--color-bg-surface) border-r border-(--color-border) shrink-0`}>
                <Sidebar />
            </div>

            {/* Main Area */}
            <div className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden relative bg-(--color-bg-chat)`}>
                {children}
            </div>
        </div>
    );
}
