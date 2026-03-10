"use client";

import { useMemo } from "react";

export default function TypingIndicator({ typers }: { typers: string[] }) {
    if (!typers || typers.length === 0) return null;

    const displayText =
        typers.length === 1
            ? `${typers[0]} is typing...`
            : typers.length === 2
                ? `${typers[0]} and ${typers[1]} are typing...`
                : "Multiple people are typing...";

    return (
        <div className="flex items-center gap-3 px-2 py-3 mt-1 mr-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex bg-white/5 px-4 py-2.5 rounded-2xl rounded-bl-[4px] border border-white/5 items-center gap-1.5 shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm font-medium text-slate-400">{displayText}</span>
        </div>
    );
}
