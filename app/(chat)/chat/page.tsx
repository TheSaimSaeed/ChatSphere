"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ChatHeader from "@/components/chat/ChatHeader";
import MessageArea from "@/components/chat/MessageArea";
import MessageInput from "@/components/chat/MessageInput";

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
            <footer className="p-6 bg-(--chat-bg)/80 backdrop-blur-md border-t border-white/5 opacity-50 grayscale pointer-events-none">
                <div className="max-w-4xl mx-auto flex items-end gap-4">
                    <div className="flex items-center gap-2 mb-1">
                        <button className="p-2 text-slate-600">
                            <span className="material-symbols-outlined">add_circle</span>
                        </button>
                        <button className="p-2 text-slate-600">
                            <span className="material-symbols-outlined">mood</span>
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-slate-600 placeholder:text-slate-600 resize-none max-h-32 min-h-12 outline-none" disabled placeholder="Select a chat to type..." rows={1}></textarea>
                        <button className="absolute right-3 bottom-2.5 text-slate-600 p-1" disabled>
                            <span className="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
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
