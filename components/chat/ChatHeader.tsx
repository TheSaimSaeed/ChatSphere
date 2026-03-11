"use client";

import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Avatar } from "@/components/shared/Avatar";
import { setActiveChatId } from "@/store/slices/chatSlice";

/** Displays the header for the active chat containing contact details and actions */
export default function ChatHeader() {
    const dispatch = useDispatch<AppDispatch>();
    const { activeChatId, chats } = useSelector((state: RootState) => state.chat);
    const { user } = useSelector((state: RootState) => state.auth);

    const activeChat = useMemo(() => {
        return chats.find((c) => c._id === activeChatId);
    }, [activeChatId, chats]);

    if (!activeChat || !user) return null;

    // Filter out the logged-in user to find the actual contact we are talking to
    const contact = !activeChat.isGroup ? activeChat.participants.find((p: any) => p._id !== user._id) : null;

    const name = activeChat.isGroup ? activeChat.name : (contact?.name || 'Unknown');
    const avatarImg = activeChat.isGroup ? activeChat.avatar : contact?.avatar;
    const presence = contact?.isOnline ? 'Online' : 'Offline'; // Slice 6 Presence Prep

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 z-20 bg-(--chat-bg) shrink-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(setActiveChatId(null))}
                    className="md:hidden text-slate-400 hover:text-(--primary) mr-2 transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div className="relative">
                    <Avatar name={name} src={avatarImg} className="size-10 rounded-full object-cover" />
                    {presence === 'Online' && (
                        <div className="absolute bottom-0 right-0 size-2.5 bg-(--primary) border-2 border-[#0D1117] rounded-full"></div>
                    )}
                </div>
                <div>
                    <h2 className="font-bold text-slate-100">{name}</h2>
                    <p className="text-[10px] text-(--primary) font-bold uppercase tracking-wider">
                        {presence === 'Online' ? 'Active Now' : 'Offline'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-(--primary) transition-colors hidden sm:block">
                    <span className="material-symbols-outlined">videocam</span>
                </button>
                <button className="p-2 text-slate-400 hover:text-(--primary) transition-colors hidden sm:block">
                    <span className="material-symbols-outlined">call</span>
                </button>
                <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block"></div>
                <button className="p-2 text-slate-400 hover:text-(--primary) transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
            </div>
        </header>
    );
}
