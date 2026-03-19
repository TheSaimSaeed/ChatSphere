"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ChatHeader from "@/components/chat/ChatHeader";
import MessageArea from "@/components/chat/MessageArea";
import MessageInput from "@/components/chat/MessageInput";
import ContactInfoPanel from "@/components/chat/ContactInfoPanel";

function ChatDashboardContent() {
    const { activeChatId } = useSelector((state: RootState) => state.chat);
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id');

    if (activeChatId || idParam) {
        return (
            <main className="flex-1 flex flex-col h-full bg-(--color-bg-base) relative overflow-hidden">
                <ChatHeader />
                <MessageArea />
                <MessageInput />
                <ContactInfoPanel />
            </main>
        );
    }

    return (
        <main className="flex-1 flex flex-col bg-(--chat-bg) relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="relative mb-8">
                    <div className="size-32 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                        <span className="material-symbols-outlined text-primary text-[64px] font-light">chat_add_on</span>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">No active conversations</h2>
                <p className="text-slate-500 text-center max-w-sm mb-8">Select a contact or start a new chat to begin connecting with your team and friends.</p>
                <button className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 flex items-center gap-2">
                    <span className="material-symbols-outlined">add</span>
                    Start New Chat
                </button>
            </div>
            <footer className="p-3 bg-(--chat-bg)/80 backdrop-blur-md border-t border-white/5 opacity-50 grayscale pointer-events-none">

                <div className="mt-4 flex justify-center">
                    <div className="flex items-center gap-2 text-slate-700">
                        <span className="material-symbols-outlined text-sm">lock</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">End-to-end encrypted</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}

export default function ChatDashboardPage() {
    return (
        <Suspense fallback={<div className="flex w-full h-full items-center justify-center bg-(--color-bg-chat) text-(--color-text-secondary)">Loading...</div>}>
            <ChatDashboardContent />
        </Suspense>
    );
}
