"use client";

import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { Avatar } from "@/components/shared/Avatar";
import { setActiveChatId } from "@/store/slices/chatSlice";
import { setContactInfoOpen, setGroupInfoOpen, addToast } from "@/store/slices/uiSlice";
import { leaveGroupThunk } from "@/store/slices/chatThunks";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreVertical, Info, LogOut, User } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

/** Displays the header for the active chat containing contact details and action buttons. */
export default function ChatHeader() {
    const dispatch = useDispatch<AppDispatch>();
    const { activeChatId, chats } = useSelector((state: RootState) => state.chat);
    const { user } = useSelector((state: RootState) => state.auth);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const activeChat = useMemo(() => chats.find((c) => c._id === activeChatId), [activeChatId, chats]);

    if (!activeChat || !user) return null;

    const contact = !activeChat.isGroup
        ? activeChat.participants.find((p: any) => p._id !== user._id)
        : null;

    const name = activeChat.isGroup ? activeChat.name : contact?.name || "Unknown";
    const avatarImg = activeChat.isGroup ? activeChat.icon : contact?.avatar;

    let presenceText = "";
    if (activeChat.isGroup) {
        presenceText = `${activeChat.participants.length} members`;
    } else if (contact?.isOnline) {
        presenceText = "Online";
    } else if (contact?.lastSeen) {
        const d = new Date(contact.lastSeen);
        if (isToday(d)) presenceText = `Last seen today at ${format(d, "HH:mm")}`;
        else if (isYesterday(d)) presenceText = "Last seen yesterday";
        else if (differenceInDays(new Date(), d) < 7) presenceText = `Last seen ${format(d, "EEEE")}`;
        else presenceText = `Last seen ${format(d, "dd MMM")}`;
    } else {
        presenceText = "Offline";
    }

    const handleLeaveGroup = async () => {
        if (!activeChatId) return;
        setLeaving(true);
        const result = await dispatch(leaveGroupThunk(activeChatId));
        setLeaving(false);
        if (leaveGroupThunk.fulfilled.match(result)) {
            dispatch(addToast({ id: uuidv4(), message: "You left the group.", type: "info" }));
        } else {
            dispatch(addToast({ id: uuidv4(), message: "Failed to leave group.", type: "error" }));
        }
        setConfirmLeave(false);
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 z-20 bg-(--chat-bg) shrink-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => dispatch(setActiveChatId(null))}
                    className="md:hidden text-slate-400 hover:text-(--primary) mr-2 transition-colors"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div
                    className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                        activeChat.isGroup
                            ? dispatch(setGroupInfoOpen(true))
                            : dispatch(setContactInfoOpen(true))
                    }
                >
                    <div className="relative">
                        <Avatar name={name ?? "G"} src={avatarImg ?? undefined} className="size-10 rounded-full object-cover" />
                        {!activeChat.isGroup && contact?.isOnline && (
                            <div className="absolute bottom-0 right-0 size-2.5 bg-(--primary) border-2 border-[#0D1117] rounded-full" />
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-100">{name}</h2>
                        <p className="text-xs text-(--primary) opacity-80 mt-0.5">{presenceText}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 text-slate-400 hover:text-(--primary) transition-colors rounded-lg hover:bg-white/5">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-(--color-bg-surface) text-(--color-text-primary) border-(--color-border)">
                        {activeChat.isGroup ? (
                            <>
                                <DropdownMenuItem
                                    className="cursor-pointer flex items-center gap-2"
                                    onClick={() => dispatch(setGroupInfoOpen(true))}
                                >
                                    <Info className="w-4 h-4" />
                                    Group Info
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-(--color-border)" />
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-400 focus:text-red-400 flex items-center gap-2"
                                    onClick={() => setConfirmLeave(true)}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Exit Group
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <DropdownMenuItem
                                className="cursor-pointer flex items-center gap-2"
                                onClick={() => dispatch(setContactInfoOpen(true))}
                            >
                                <User className="w-4 h-4" />
                                View Contact
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Leave group confirmation overlay */}
            {confirmLeave && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1C2431] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-base font-bold text-slate-100 mb-2">Exit group?</h3>
                        <p className="text-sm text-slate-400 mb-5">
                            You will no longer receive messages from <span className="text-slate-200 font-medium">{name}</span>.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmLeave(false)}
                                className="flex-1 py-2.5 text-sm font-medium text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLeaveGroup}
                                disabled={leaving}
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition"
                            >
                                {leaving ? "Leaving…" : "Exit Group"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
