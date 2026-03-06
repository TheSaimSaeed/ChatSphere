"use client";

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchChatsThunk } from '@/store/slices/chatThunks';
import { setActiveChatId } from '@/store/slices/chatSlice';
import ChatListItem from './ChatListItem';
import NewDMOverlay from './NewDMOverlay';

export default function Sidebar() {
    const dispatch = useDispatch<AppDispatch>();
    const { chats, activeChatId } = useSelector((state: RootState) => state.chat);
    const { user } = useSelector((state: RootState) => state.auth);

    const [searchQuery, setSearchQuery] = useState('');
    const [isNewDMOpen, setIsNewDMOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchChatsThunk());
    }, [dispatch]);

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const q = searchQuery.toLowerCase();

        return chats.filter(chat => {
            if (chat.isGroup) {
                return chat.name?.toLowerCase().includes(q);
            } else {
                const other = chat.participants.find(p => p._id !== user?._id) || chat.participants[0];
                return other?.name?.toLowerCase().includes(q) || other?.email?.toLowerCase().includes(q);
            }
        });
    }, [chats, searchQuery, user?._id]);

    const handleChatClick = (chatId: string) => {
        dispatch(setActiveChatId(chatId));
        // On mobile, this will also slide the right panel in (handled in layout/page)
    };

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Header */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-(--color-text-primary)">Messages</h1>
                    <button
                        onClick={() => setIsNewDMOpen(true)}
                        className="size-8 bg-(--color-primary) rounded-lg flex items-center justify-center text-black hover:bg-(--color-primary-dark) transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                </div>
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary) group-focus-within:text-(--color-primary) transition-colors text-sm">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full pl-10 pr-4 py-2 bg-(--color-bg-base) border border-(--color-border) rounded-lg focus:ring-1 focus:ring-(--color-primary)/50 focus:border-(--color-primary)/50 text-sm placeholder:text-(--color-text-secondary) text-(--color-text-primary) outline-none"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-(--color-bg-surface)">
                {chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="size-16 rounded-full bg-(--color-bg-base) flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-(--color-text-secondary) text-3xl">chat_bubble</span>
                        </div>
                        <p className="text-sm font-semibold text-(--color-text-secondary)">No messages yet</p>
                        <p className="text-xs text-(--color-text-secondary) mt-1">Your recent conversations will appear here.</p>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="flex justify-center py-10 px-6 text-center text-(--color-text-secondary)">
                        <p className="text-sm">No chats match "{searchQuery}"</p>
                    </div>
                ) : (
                    <div>
                        {filteredChats.map(chat => (
                            <ChatListItem
                                key={chat._id}
                                chat={chat}
                                isActive={chat._id === activeChatId}
                                onClick={() => handleChatClick(chat._id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* New DM Overlay */}
            <NewDMOverlay isOpen={isNewDMOpen} onClose={() => setIsNewDMOpen(false)} />
        </div>
    );
}
