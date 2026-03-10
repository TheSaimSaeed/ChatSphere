"use client";

import { useMemo } from "react";
import { format } from "date-fns";


import { Avatar } from "@/components/shared/Avatar";

type MessageBubbleProps = {
    message: any;
    isOutgoing: boolean;
    isConsecutive: boolean;
};

/** Displays an individual message bubble for text or media */
export default function MessageBubble({ message, isOutgoing, isConsecutive }: MessageBubbleProps) {
    const time = message.createdAt ? format(new Date(message.createdAt), "hh:mm a") : "";

    const renderTicks = () => {
        if (!isOutgoing) return null;
        if (message.status?.readBy?.length > 0) {
            return <span className="material-symbols-outlined text-[#53bdeb] text-xs">done_all</span>;
        }
        if (message.status?.deliveredTo?.length > 0) {
            return <span className="material-symbols-outlined text-slate-400 text-xs">done_all</span>;
        }
        if (message.status?.sent) {
            return <span className="material-symbols-outlined text-slate-400 text-xs">check</span>;
        }
        return <span className="material-symbols-outlined text-slate-400 text-xs">schedule</span>;
    };

    const senderName = message?.senderId?.name || 'User';

    return (
        <div className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'} ${isConsecutive ? '-mt-4' : ''}`}>
            <div className={`flex gap-3 max-w-[80%] ${isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar for Incoming */}
                {!isOutgoing && (
                    <div className="shrink-0 flex flex-col justify-end pb-5">
                        {!isConsecutive ? (
                            <Avatar name={senderName} className="size-8 rounded-full border border-white/10" />
                        ) : (
                            <div className="w-8" />
                        )}
                    </div>
                )}

                {/* Message Bubble Block */}
                <div className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} max-w-full min-w-0`}>
                    <div
                        className={
                            isOutgoing
                                ? `bg-(--primary) px-4 py-3 text-black shadow-lg shadow-(--primary)/10 ${isConsecutive ? 'rounded-2xl' : 'rounded-2xl rounded-br-[4px]'
                                }`
                                : `bg-white/5 px-4 py-3 border border-white/5 ${isConsecutive ? 'rounded-2xl' : 'rounded-2xl rounded-bl-[4px]'
                                }`
                        }
                    >
                        {message.type === 'text' && (
                            <p className={`${isOutgoing ? 'text-sm font-medium' : 'text-sm text-slate-200'} whitespace-pre-wrap break-words leading-relaxed`}>
                                {message.content}
                            </p>
                        )}
                    </div>

                    {/* Meta Footer (Time & Status) */}
                    <div className={`flex items-center gap-1 mt-1 ${isOutgoing ? 'pr-1' : 'pl-1'}`}>
                        <span className="text-[10px] text-slate-500 font-medium tracking-wide">{time}</span>
                        {renderTicks()}
                    </div>
                </div>
            </div>
        </div>
    );
}
