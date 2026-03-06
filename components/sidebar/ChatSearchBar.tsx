"use client";

import { Search, X } from 'lucide-react';
import { ChangeEvent } from 'react';

interface ChatSearchBarProps {
    value: string;
    onChange: (val: string) => void;
}

/** Renders the client-side search input for filtering the existing chat list. */
export default function ChatSearchBar({ value, onChange }: ChatSearchBarProps) {
    const handleClear = () => {
        onChange('');
    };

    return (
        <div className="flex items-center h-12 px-3 py-2 bg-(--color-bg-base)">
            <div className="relative w-full h-8 flex items-center bg-white dark:bg-(--color-bg-surface) rounded-lg">
                <Search className="absolute left-3 w-4 h-4 text-(--color-text-secondary) pointer-events-none" strokeWidth={2} />
                <input
                    type="text"
                    value={value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    placeholder="Search or start new chat"
                    className="w-full h-full pl-10 pr-8 bg-transparent text-sm text-(--color-text-primary) placeholder:text-(--color-text-secondary) focus:outline-none rounded-lg"
                />
                {value.length > 0 && (
                    <button
                        onClick={handleClear}
                        className="absolute right-2 text-(--color-text-secondary) hover:text-(--color-text-primary) focus:outline-none"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
