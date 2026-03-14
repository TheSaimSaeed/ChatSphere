"use client";

import { format } from "date-fns";
import { Avatar } from "@/components/shared/Avatar";

/** Returns a deterministic hex colour from a sender's ID for group name colouring. */
function senderColour(id: string): string {
    const palette = [
        "#a78bfa", "#34d399", "#60a5fa", "#f87171",
        "#fbbf24", "#f472b6", "#4ade80", "#38bdf8",
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
    return palette[hash % palette.length];
}

type MessageBubbleProps = {
    message: any;
    isOutgoing: boolean;
    isConsecutive: boolean;
    isGroup?: boolean;
};

/** Displays an individual message bubble for text, media, or system messages. */
export default function MessageBubble({
    message,
    isOutgoing,
    isConsecutive,
    isGroup = false,
}: MessageBubbleProps) {
    const time = message.createdAt ? format(new Date(message.createdAt), "hh:mm a") : "";

    // System messages render as a centred chip
    if (message.type === "system") {
        return (
            <div className="flex justify-center my-1">
                <span className="px-3 py-1 bg-white/5 border border-white/5 text-slate-400 text-[11px] rounded-full">
                    {message.content}
                </span>
            </div>
        );
    }

    const renderTicks = () => {
        if (!isOutgoing) return null;
        if (message.status?.readBy?.length > 0)
            return <span className="material-symbols-outlined text-[#53bdeb] text-xs">done_all</span>;
        if (message.status?.deliveredTo?.length > 0)
            return <span className="material-symbols-outlined text-slate-400 text-xs">done_all</span>;
        if (message.status?.sent)
            return <span className="material-symbols-outlined text-slate-400 text-xs">check</span>;
        return <span className="material-symbols-outlined text-slate-400 text-xs">schedule</span>;
    };

    const senderIdRaw =
        typeof message.senderId === "object" ? message.senderId?._id : message.senderId;
    const senderIdStr = senderIdRaw ? String(senderIdRaw) : "";
    const senderName = message?.senderId?.name || "User";

    return (
        <div className={`flex w-full ${isOutgoing ? "justify-end" : "justify-start"} ${isConsecutive ? "-mt-4" : ""}`}>
            <div className={`flex gap-2 max-w-[80%] ${isOutgoing ? "flex-row-reverse" : "flex-row"}`}>
                {/* Sender avatar for group incoming messages */}
                {!isOutgoing && (
                    <div className="shrink-0 flex flex-col justify-end pb-5">
                        {!isConsecutive ? (
                            <Avatar
                                name={senderName}
                                src={message?.senderId?.avatar}
                                className="size-6 rounded-full border border-white/10"
                            />
                        ) : (
                            <div className="w-6" />
                        )}
                    </div>
                )}

                {/* Bubble block */}
                <div className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"} max-w-full min-w-0`}>
                    {/* Sender name (only in group, incoming, first-in-run) */}
                    {isGroup && !isOutgoing && !isConsecutive && (
                        <span
                            className="text-[11px] font-semibold mb-0.5 px-1"
                            style={{ color: senderColour(senderIdStr) }}
                        >
                            {senderName}
                        </span>
                    )}

                    <div
                        className={
                            isOutgoing
                                ? `bg-(--primary) px-4 py-3 text-black shadow-lg shadow-(--primary)/10 ${
                                      isConsecutive ? "rounded-2xl" : "rounded-2xl rounded-br-[4px]"
                                  }`
                                : `bg-white/5 px-4 py-3 border border-white/5 ${
                                      isConsecutive ? "rounded-2xl" : "rounded-2xl rounded-bl-[4px]"
                                  }`
                        }
                    >
                        {message.type === "text" && (
                            <p
                                className={`${
                                    isOutgoing ? "text-sm font-medium" : "text-sm text-slate-200"
                                } whitespace-pre-wrap break-words leading-relaxed`}
                            >
                                {message.content}
                            </p>
                        )}
                    </div>

                    {/* Meta footer */}
                    <div className={`flex items-center gap-1 mt-1 ${isOutgoing ? "pr-1" : "pl-1"}`}>
                        <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                            {time}
                        </span>
                        {renderTicks()}
                    </div>
                </div>
            </div>
        </div>
    );
}
