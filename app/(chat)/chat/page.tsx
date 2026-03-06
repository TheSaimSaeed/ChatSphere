"use client";

import { Lock } from "lucide-react";
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
            <div className="flex flex-col items-center justify-center w-full h-full bg-[var(--color-bg-chat)]">
                <p className="text-[var(--color-text-secondary)] text-[var(--text-lg)]">
                    Active Chat (ID: {activeChatId || idParam})
                </p>
                <p className="text-[var(--color-text-secondary)] mt-2">
                    Message flow will be built in Slice 4.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-[var(--color-bg-chat)] text-center px-4">
            <Lock className="w-[80px] h-[80px] text-[var(--color-text-secondary)] opacity-40 mb-4" strokeWidth={1} />
            <h2 className="text-[var(--color-text-secondary)] text-[var(--text-lg)] font-medium mb-2">
                Select a chat to start messaging
            </h2>
            <p className="text-[var(--color-text-secondary)] text-[var(--text-sm)] max-w-sm">
                Your messages are private and delivered in real time.
            </p>
        </div>
    );
}

export default function ChatDashboardPage() {
    return (
        <Suspense fallback={<div className="flex w-full h-full items-center justify-center bg-[var(--color-bg-chat)] text-[var(--color-text-secondary)]">Loading...</div>}>
            <ChatDashboardContent />
        </Suspense>
    );
}
