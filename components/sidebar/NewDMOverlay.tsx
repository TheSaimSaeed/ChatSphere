"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, User as UserIcon } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import { Spinner } from '@/components/shared/Spinner';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { createDMThunk } from '@/store/slices/chatThunks';
import { useRouter } from 'next/navigation';

// Custom debounce
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

interface NewDMOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NewDMOverlay({ isOpen, onClose }: NewDMOverlayProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const searchUsers = useCallback(
        debounce(async (searchQuery: string) => {
            if (searchQuery.length < 2) {
                setResults([]);
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                if (res.ok) {
                    setResults(data.users || []);
                }
            } catch (err) {
                console.error("Failed to search users", err);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        if (query.length >= 2) {
            setIsLoading(true);
            searchUsers(query);
        } else {
            setResults([]);
        }
    }, [query, searchUsers]);

    const handleCreateDM = async (userId: string) => {
        const action = await dispatch(createDMThunk(userId));
        if (createDMThunk.fulfilled.match(action)) {
            router.push(`/chat?id=${action.payload._id}`);
            onClose();
            setQuery('');
            setResults([]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute inset-0 z-50 flex flex-col bg-(--color-bg-surface)"
                >
                    {/* Header */}
                    <div className="flex items-center h-14 px-4 bg-(--color-header) text-white shrink-0 shadow-sm z-10">
                        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="ml-4 font-bold text-lg">New Chat</h2>
                    </div>

                    {/* Search Input */}
                    <div className="p-3 bg-(--color-bg-base)">
                        <div className="relative flex items-center bg-white dark:bg-(--color-bg-surface) rounded-lg h-12 shadow-sm">
                            <Search className="absolute left-4 w-5 h-5 text-(--color-text-secondary) pointer-events-none" />
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name or email"
                                className="w-full h-full pl-12 pr-4 bg-transparent outline-none text-base text-(--color-text-primary)"
                            />
                        </div>
                    </div>

                    {/* Results / Empty States */}
                    <div className="flex-1 overflow-y-auto bg-(--color-bg-surface)">
                        {isLoading && (
                            <div className="flex justify-center p-6">
                                <Spinner className="w-8 h-8 opacity-50" />
                            </div>
                        )}

                        {!isLoading && query.length > 0 && query.length < 2 && (
                            <div className="flex flex-col items-center justify-center py-10 px-6 text-center text-(--color-text-secondary)">
                                <p className="text-sm">Type at least 2 characters to search.</p>
                            </div>
                        )}

                        {!isLoading && query.length >= 2 && results.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-(--color-text-secondary)">
                                <UserIcon className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-sm">No users found. Try a different name or email.</p>
                            </div>
                        )}

                        {!isLoading && results.length > 0 && (
                            <div className="flex flex-col">
                                {results.map(user => (
                                    <div
                                        key={user._id}
                                        onClick={() => handleCreateDM(user._id)}
                                        className="flex items-center h-16 px-4 py-2 cursor-pointer hover:bg-(--color-bg-base) border-b border-(--color-border) last:border-0"
                                    >
                                        <Avatar name={user.name} src={user.avatar} isOnline={user.isOnline} className="w-12 h-12 shrink-0" />
                                        <div className="flex flex-col ml-3 overflow-hidden">
                                            <span className="text-base font-medium text-(--color-text-primary) truncate">{user.name}</span>
                                            <span className="text-sm text-(--color-text-secondary) truncate">{user.email}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
