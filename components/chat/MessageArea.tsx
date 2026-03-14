"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchMessagesThunk } from "@/store/slices/chatThunks";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { getSocketClient } from "@/lib/socket/client";
import { SOCKET_EVENTS } from "@/lib/socket/events";

export default function MessageArea() {
    const dispatch = useDispatch<AppDispatch>();
    const { activeChatId, messagesByChatId, typingByChatId } = useSelector((state: RootState) => state.chat);
    // Again, assume we can get user ID or we pass it down
    // Since user isn't fully set up in my snippet, I'll pretend we have auth user
    const user = useSelector((state: any) => state.auth?.user);
    const isMockUser = !user?._id;

    const messages = messagesByChatId[activeChatId || ''] || [];
    const typingUsers = typingByChatId[activeChatId || ''] || [];
    const typersNames = typingUsers.map(u => u.name);

    const activeChat = useSelector((s: RootState) => s.chat.chats.find((c) => c._id === activeChatId));
    const isGroupChat = activeChat?.isGroup ?? false;

    const containerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        if (!activeChatId) return;

        // Fetch initial if we don't have any
        if (messages.length === 0) {
            setLoading(true);
            dispatch(fetchMessagesThunk({ chatId: activeChatId })).finally(() => setLoading(false));

            // Note: we can join room here
            const socket = getSocketClient();
            if (socket.connected) {
                socket.emit("join_room", activeChatId as string);
            }
        }

        // Emit message:read whenever active chat changes or new messages arrive
        const socket = getSocketClient();
        if (activeChatId) {
            socket.emit(SOCKET_EVENTS.MESSAGE_READ, { chatId: activeChatId });
        }
    }, [activeChatId, dispatch, messages.length]);

    // Intersection observer for auto-scrolling up
    useEffect(() => {
        const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading && hasMore && messages.length >= 30) {
                if (!activeChatId) return;

                setLoading(true);
                const before = messages[0]._id; // top message
                dispatch(fetchMessagesThunk({ chatId: activeChatId, before })).then((action: any) => {
                    if (action.payload?.messages?.length < 30) {
                        setHasMore(false);
                    }
                    // Retain scroll position to avoid jump
                    if (containerRef.current) {
                        const previousHeight = containerRef.current.scrollHeight;
                        requestAnimationFrame(() => {
                            if (containerRef.current) {
                                containerRef.current.scrollTop = containerRef.current.scrollHeight - previousHeight;
                            }
                        });
                    }
                    setLoading(false);
                });
            }
        });

        if (sentinelRef.current) {
            io.observe(sentinelRef.current);
        }
        return () => io.disconnect();
    }, [dispatch, activeChatId, loading, hasMore, messages]);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
            setHasUnread(false);
        }
    };

    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const distToBottom = scrollHeight - scrollTop - clientHeight;

        if (distToBottom < 50) {
            setHasUnread(false);
        }
    };

    const prevMessagesLengthRef = useRef(messages.length);
    // Auto scroll on new message if already near bottom, OR show new message banner
    useEffect(() => {
        if (!containerRef.current) {
            prevMessagesLengthRef.current = messages.length;
            return;
        }
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

        if (messages.length > prevMessagesLengthRef.current) {
            if (isNearBottom) {
                containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
            } else {
                setHasUnread(true);
            }
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages.length, activeChatId]);

    // Scroll manipulation when typing status changes
    useEffect(() => {
        if (!containerRef.current || typersNames.length === 0) return;

        const scrollHeight = containerRef.current.scrollHeight;
        const scrollTop = containerRef.current.scrollTop;
        const clientHeight = containerRef.current.clientHeight;
        const currentScrollPos = scrollTop + clientHeight;

        // If user is within ~150px of the bottom, smoothly auto-scroll down so they see the indicator
        if (scrollHeight - currentScrollPos < 150) {
            containerRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
        }
    }, [typersNames.length]);

    return (
        <div className="flex-1 relative flex flex-col overflow-hidden bg-(--chat-bg)">
            {/* Auto scroll banner */}
            {hasUnread && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <button
                        onClick={scrollToBottom}
                        className="pointer-events-auto bg-[#1E1E1E]/90 backdrop-blur-md flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 shadow-2xl hover:bg-white/10 transition-all group scale-in-center"
                    >
                        <div className="relative">
                            <span className="material-symbols-outlined text-slate-200 text-xl group-hover:translate-y-0.5 transition-transform">arrow_downward</span>
                            <div className="absolute -top-1 -right-1 size-2 bg-(--primary) rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-100 whitespace-nowrap">New Messages</span>
                    </button>
                    <style>{`
                        .scale-in-center { animation: scale-in-center 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
                        @keyframes scale-in-center {
                            0% { transform: scale(0); opacity: 1; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}

            <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div ref={sentinelRef} className="h-1 shrink-0" />

                {loading && (
                    <div className="flex justify-center my-4">
                        <span className="material-symbols-outlined text-slate-500 animate-spin">progress_activity</span>
                    </div>
                )}

                {!hasMore && messages.length > 0 && (
                    <div className="flex justify-center my-4">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
                            Beginning of conversation
                        </span>
                    </div>
                )}

                {messages.length === 0 && !loading && (
                    <div className="flex justify-center mt-10">
                        <p className="text-slate-500 bg-white/5 px-4 py-2 border border-white/5 rounded-2xl text-sm shrink-0">
                            No messages yet. Send a message to start the conversation.
                        </p>
                    </div>
                )}

                <div className="flex flex-col space-y-6 pb-2">
                    {messages.map((msg, idx) => {
                        const msgSenderIdRaw = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
                        const msgSenderIdStr = msgSenderIdRaw ? String(msgSenderIdRaw) : '';
                        const currentUserIdStr = user?._id ? String(user._id) : '';

                        const isOutgoing = (msgSenderIdStr === currentUserIdStr && currentUserIdStr !== '') || (isMockUser && msg._id?.startsWith('temp_'));

                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                        const prevSenderIdRaw = prevMsg ? (typeof prevMsg.senderId === 'object' ? prevMsg.senderId?._id : prevMsg.senderId) : null;
                        const prevSenderStr = prevSenderIdRaw ? String(prevSenderIdRaw) : '';
                        const isConsecutive = prevSenderStr === msgSenderIdStr && msgSenderIdStr !== '';

                        return (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isOutgoing={isOutgoing}
                                isConsecutive={isConsecutive}
                                isGroup={isGroupChat}
                            />
                        );
                    })}
                </div>

                <TypingIndicator typers={typersNames} />
            </div>
        </div>
    );
}
