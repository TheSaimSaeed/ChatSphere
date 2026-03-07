"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getSocketClient } from "@/lib/socket/client";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { SendMessageInput } from "@/lib/validations/messageSchemas";
import { addMessage } from "@/store/slices/chatSlice";

export default function MessageInput() {
    const dispatch = useDispatch<AppDispatch>();
    const [content, setContent] = useState("");
    const { activeChatId, chats } = useSelector((state: RootState) => state.chat);
    // Replace with actual user ID from authSlice once available
    // For now we get from socket client or auth slice? Assuming user is from somewhere else.
    // Auth slice has it.
    const user = useSelector((state: any) => state.auth?.user);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isGroup = chats.find(c => c._id === activeChatId)?.isGroup || false;

    // Auto resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [content]);

    const handleSend = () => {
        if (!content.trim() || !activeChatId || !user) return;

        const payload: SendMessageInput = {
            chatId: activeChatId,
            content: content.trim(),
            type: "text",
            mediaId: undefined
        };

        const tempMessage = {
            _id: "temp_" + Date.now(),
            chatId: activeChatId,
            content: content.trim(),
            type: "text" as const,
            senderId: user?._id || "mock",
            createdAt: new Date().toISOString(),
            status: { sent: false },
            media: null
        };

        dispatch(addMessage(tempMessage));

        const socket = getSocketClient();
        if (socket.connected) {
            socket.emit(SOCKET_EVENTS.MESSAGE_SEND, payload);
        } else {
            // Fallback REST call
            fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }).catch(console.error);
        }

        setContent("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <footer className="p-6 bg-(--charcoal) border-t border-white/5 z-10 shrink-0">
            <div className="flex items-center gap-4 bg-white/5 p-2 pl-4 rounded-xl border border-white/10">
                <button className="text-slate-500 hover:text-(--primary) transition-colors">
                    <span className="material-symbols-outlined">add_circle</span>
                </button>
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 placeholder:text-slate-500 outline-none"
                    type="text"
                />
                <div className="flex items-center gap-2 pr-2">
                    <button className="p-2 text-slate-500 hover:text-(--primary) transition-colors">
                        <span className="material-symbols-outlined">sentiment_satisfied</span>
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!content.trim()}
                        className="size-10 bg-(--primary) rounded-lg flex items-center justify-center text-black hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined font-bold">send</span>
                    </button>
                </div>
            </div>
        </footer>
    );
}
