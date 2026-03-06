"use client";

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchChatsThunk } from '@/store/slices/chatThunks';
import { setActiveChatId } from '@/store/slices/chatSlice';
import SidebarHeader from './SidebarHeader';
import ChatSearchBar from './ChatSearchBar';
import ChatListItem from './ChatListItem';
import NewDMOverlay from './NewDMOverlay';
import { Coffee } from 'lucide-react';

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
            <SidebarHeader onNewDMClick={() => setIsNewDMOpen(true)} />
            <ChatSearchBar value={searchQuery} onChange={setSearchQuery} />

            <div className="flex-1 overflow-y-auto bg-[var(--color-bg-surface)]">
                {chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-[var(--color-text-secondary)]">
                        <Coffee className="w-16 h-16 mb-4 opacity-30 text-[var(--color-primary)]" />
                        <p className="text-[var(--text-lg)] font-medium text-[var(--color-text-primary)] mb-2">No chats yet</p>
                        <p className="text-[var(--text-md)] mb-6">Start a new conversation!</p>
                        <button
                            onClick={() => setIsNewDMOpen(true)}
                            className="h-10 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-[10px] text-[var(--text-md)] font-semibold transition"
                        >
                            New Chat
                        </button>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="flex justify-center py-10 px-6 text-center text-[var(--color-text-secondary)]">
                        <p className="text-[var(--text-sm)]">No chats match "{searchQuery}"</p>
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

            <NewDMOverlay isOpen={isNewDMOpen} onClose={() => setIsNewDMOpen(false)} />
        </div>
    );
}
