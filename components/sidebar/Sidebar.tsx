"use client";

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { RootState, AppDispatch } from '@/store';
import { fetchChatsThunk } from '@/store/slices/chatThunks';
import { setActiveChatId } from '@/store/slices/chatSlice';
import ChatListItem from './ChatListItem';
import NewDMOverlay from './NewDMOverlay';

/** Renders the main sidebar containing the chat list, search bar, and new DM overlay. */
export default function Sidebar() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const { chats, activeChatId } = useSelector((state: RootState) => state.chat);
    const { user } = useSelector((state: RootState) => state.auth);

    const [searchQuery, setSearchQuery] = useState('');
    const [isNewDMOpen, setIsNewDMOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        dispatch(fetchChatsThunk()).finally(() => setIsLoading(false));
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
    };

    return (
        <section className="w-full h-full md:w-80 flex flex-col bg-(--sidebar-deep) border-r border-white/5 shrink-0 relative overflow-hidden">
            {/* Desktop Header */}
            <div className="p-5 pb-3 hidden md:block">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-lg font-bold text-slate-100">Messages</h1>
                    <button
                        onClick={() => setIsNewDMOpen(true)}
                        className="size-8 bg-(--primary) rounded-lg flex items-center justify-center text-black hover:bg-(--primary)/90 transition-colors"
                        title="New conversation"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    </button>
                </div>
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-(--primary) transition-colors" style={{ fontSize: '16px' }}>search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-1 focus:ring-(--primary)/50 focus:border-(--primary)/50 text-sm placeholder:text-slate-600 text-slate-200 outline-none"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Header */}
            <header className="bg-[#0a1f1d] px-5 pt-6 pb-4 md:hidden shrink-0">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {/* Avatar — tapping navigates to /profile */}
                        <button
                            onClick={() => router.push('/profile')}
                            className="size-10 rounded-full border-2 border-(--primary)/30 overflow-hidden cursor-pointer hover:border-(--primary)/60 transition-colors"
                        >
                            {user?.avatar ? (
                                <img alt="My Profile" className="w-full h-full object-cover" src={user.avatar} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-(--primary)/20 text-(--primary) font-bold text-sm">
                                    {user?.name?.[0]?.toUpperCase() ?? '?'}
                                </div>
                            )}
                        </button>
                        <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ChatSphere</h1>
                    </div>
                    <div className="flex items-center gap-1 text-white/80">
                        <button onClick={() => setIsNewDMOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[22px]">chat_add_on</span>
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <span className="material-symbols-outlined text-[22px]">more_vert</span>
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input
                        className="w-full pl-11 pr-10 py-2.5 bg-white/10 border-none rounded-xl focus:ring-1 focus:ring-(--primary) outline-none text-sm placeholder:text-slate-400 text-white transition-all"
                        placeholder="Search conversations..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Content */}
            {isLoading ? (
                <div className="flex-1 flex flex-col gap-0 overflow-hidden pt-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 md:border-none md:rounded-2xl md:mx-2 md:my-1">
                            <div className="size-12 rounded-full bg-white/6 animate-pulse shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3.5 bg-white/6 animate-pulse rounded w-2/3" />
                                <div className="h-3 bg-white/4 animate-pulse rounded w-1/2" />
                            </div>
                            <div className="h-3 bg-white/4 animate-pulse rounded w-8" />
                        </div>
                    ))}
                </div>
            ) : filteredChats.length > 0 ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar md:px-2 md:pt-2 pb-24 md:pb-2">
                    {filteredChats.map(chat => (
                        <div className="md:mb-1 border-b border-white/5 md:border-none" key={chat._id}>
                            <ChatListItem
                                chat={chat}
                                isActive={chat._id === activeChatId}
                                onClick={() => handleChatClick(chat._id)}
                            />
                        </div>
                    ))}
                </div>
            ) : searchQuery ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <span className="material-symbols-outlined text-slate-600 text-4xl mb-3">search_off</span>
                    <p className="text-sm font-semibold text-slate-400">No results for &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-[11px] text-slate-600 mt-1">Try a different name or email.</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-slate-600 text-3xl">chat_bubble</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-400">No messages yet</p>
                    <p className="text-[11px] text-slate-600 mt-1">Your recent conversations will appear here.</p>
                    <button
                        onClick={() => setIsNewDMOpen(true)}
                        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-(--primary) hover:text-(--primary)/80 transition-colors"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                        Start a conversation
                    </button>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden absolute bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-lg border-t border-white/5 px-8 py-3 flex justify-between items-center z-30">
                <button
                    onClick={() => router.push('/chat')}
                    className={`flex flex-col items-center gap-1 transition-colors ${pathname.startsWith('/chat') ? 'text-(--primary)' : 'text-slate-500 hover:text-white'}`}
                >
                    <span className={`material-symbols-outlined text-2xl ${pathname.startsWith('/chat') ? 'fill-1' : ''}`}>chat_bubble</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Chats</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">call</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Calls</span>
                </button>
                <button
                    onClick={() => router.push('/profile')}
                    className={`flex flex-col items-center gap-1 transition-colors ${pathname.startsWith('/profile') ? 'text-(--primary)' : 'text-slate-500 hover:text-white'}`}
                >
                    <span className={`material-symbols-outlined text-2xl ${pathname.startsWith('/profile') ? 'fill-1' : ''}`}>person</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">settings</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Settings</span>
                </button>
            </nav>

            <button
                onClick={() => setIsNewDMOpen(true)}
                className="md:hidden absolute bottom-24 right-6 size-14 bg-(--primary) text-black rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-20"
            >
                <span className="material-symbols-outlined text-3xl font-bold">add_comment</span>
            </button>

            {/* New DM Overlay */}
            <NewDMOverlay isOpen={isNewDMOpen} onClose={() => setIsNewDMOpen(false)} />
        </section>
    );
}
