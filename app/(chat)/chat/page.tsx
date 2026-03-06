"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ChatDashboardContent() {
    const { activeChatId } = useSelector((state: RootState) => state.chat);
    const router = useRouter();
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id');

    // Sync activeChatId with URL state? Wait, we handle this differently, state rules first
    // In Slice 3: right panel Welcome state is rendered here. 
    // Actual chat messages (Slice 4) will still be rendered here probably or we do something else?
    // According to standard NextJS layouts, we'd use `chat/[chatId]/page.tsx`. But the PRD says we have `/chat` route.
    // If activeChatId exists, we can render the Active Chat component here later in Slice 4.

    // For Slice 3: We just show welcome screen if no active chat.

    if (activeChatId || idParam) {
        // We haven't built the Active Chat panel yet (Slice 4).
        // Let's just show an "Active Chat Skeleton/Placeholder"
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-(--color-bg-chat)">
                <p className="text-(--color-text-secondary) text-lg">
                    Active Chat (ID: {activeChatId || idParam})
                </p>
                <p className="text-(--color-text-secondary) mt-2">
                    Message flow will be built in Slice 4.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-(--color-bg-chat) text-center px-4">
            <div className="size-24 rounded-full bg-(--color-bg-base) flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-(--color-text-secondary) text-5xl">chat_bubble</span>
            </div>
            <h2 className="text-(--color-text-primary) text-2xl font-bold mb-3">
                Welcome to ChatSphere
            </h2>
            <p className="text-(--color-text-secondary) text-base max-w-md leading-relaxed">
                Connect with friends and family through secure, real-time messaging. Start a conversation or join an existing chat to get started.
            </p>
        </div>
    );
}

export default function ChatDashboardPage() {
    return (
        <Suspense fallback={<div className="flex w-full h-full items-center justify-center bg-(--color-bg-chat) text-(--color-text-secondary)">Loading...</div>}>
            <ChatDashboardContent />
        </Suspense>
    );
}
