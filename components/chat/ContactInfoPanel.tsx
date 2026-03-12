"use client";

import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { setContactInfoOpen } from "@/store/slices/uiSlice";
import { Avatar } from "@/components/shared/Avatar";
import { X, Phone, Mail, Ban, ChevronLeft, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

export default function ContactInfoPanel() {
    const dispatch = useDispatch<AppDispatch>();
    const { isContactInfoOpen } = useSelector((state: RootState) => state.ui);
    const { activeChatId, chats } = useSelector((state: RootState) => state.chat);
    const { user } = useSelector((state: RootState) => state.auth);

    const activeChat = useMemo(() => {
        return chats.find((c) => c._id === activeChatId);
    }, [activeChatId, chats]);

    if (!user || !activeChat) return null;

    // Contact info is purely for DMs in this slice MVP. 
    // We will handle group info separately or dynamically scale in slices to come.
    const isGroup = activeChat.isGroup;
    const contact = !isGroup ? activeChat.participants.find((p: any) => p._id !== user._id) : null;

    if (isGroup || !contact) {
        return null;
    }

    let presenceText = 'Offline';
    if (contact?.isOnline) {
        presenceText = 'Online';
    } else if (contact?.lastSeen) {
        const lastSeenDate = new Date(contact.lastSeen);
        if (isToday(lastSeenDate)) {
            presenceText = `Last seen today at ${format(lastSeenDate, 'HH:mm')}`;
        } else if (isYesterday(lastSeenDate)) {
            presenceText = `Last seen yesterday`;
        } else if (differenceInDays(new Date(), lastSeenDate) < 7) {
            presenceText = `Last seen ${format(lastSeenDate, 'EEEE')}`;
        } else {
            presenceText = `Last seen ${format(lastSeenDate, 'dd MMM')}`;
        }
    }

    return (
        <AnimatePresence>
            {isContactInfoOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute top-0 right-0 h-full w-full md:w-[360px] bg-[var(--color-bg-surface)] border-l border-[var(--color-border)] z-50 flex flex-col shadow-xl"
                >
                    {/* Header */}
                    <div className="h-16 flex items-center px-4 border-b border-[var(--color-border)] shrink-0">
                        <button 
                            onClick={() => dispatch(setContactInfoOpen(false))}
                            className="p-2 -ml-2 rounded-full hover:bg-white/5 transition text-slate-400 hover:text-white md:hidden"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-bold text-slate-100 flex-1 ml-2 md:ml-0">Contact Info</h2>
                        <button 
                            onClick={() => dispatch(setContactInfoOpen(false))}
                            className="p-2 -mr-2 rounded-full hover:bg-white/5 transition text-slate-400 hover:text-white hidden md:block"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pt-8 pb-12 px-6">
                        {/* Avatar & Basic Info */}
                        <Avatar name={contact.name} src={contact.avatar} className="w-24 h-24 rounded-full mb-4 shadow-lg ring-4 ring-[#0D1117]" />
                        <h3 className="text-xl font-bold text-slate-100 mb-1 text-center truncate w-full">{contact.name}</h3>
                        <div className="flex items-center gap-1.5 justify-center mb-6">
                            {contact.isOnline && <div className="w-2 h-2 rounded-full bg-[var(--color-online)]"></div>}
                            <span className="text-sm text-[var(--color-online)] opacity-80">{presenceText}</span>
                        </div>

                        {/* Details */}
                        <div className="w-full flex items-center justify-center gap-6 mb-8">
                            <div className="flex flex-col items-center gap-2 cursor-pointer group">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition">
                                    <Phone className="w-5 h-5 text-slate-400 group-hover:text-[var(--color-primary)]" />
                                </div>
                                <span className="text-xs text-slate-400 group-hover:text-slate-200">Call</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 cursor-pointer group">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition">
                                    <Mail className="w-5 h-5 text-slate-400 group-hover:text-[var(--color-primary)]" />
                                </div>
                                <span className="text-xs text-slate-400 group-hover:text-slate-200">Email</span>
                            </div>
                        </div>

                        <div className="w-full bg-[#0D1117] rounded-xl p-4 border border-[var(--color-border)] flex flex-col gap-4 mb-6">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Status</span>
                                <span className="text-sm text-slate-200 italic">
                                    {contact.statusMessage || "Hey there! I'm using ChatSphere."}
                                </span>
                            </div>
                            <hr className="border-t border-white/5" />
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Email address</span>
                                <span className="text-sm text-slate-200">{contact.email}</span>
                            </div>
                            {contact.phone && (
                                <>
                                    <hr className="border-t border-white/5" />
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">Phone number</span>
                                        <span className="text-sm text-slate-200">{contact.phone}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Shared Media Placeholder */}
                        <div className="w-full mb-8">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h4 className="text-sm font-semibold text-slate-300">Shared Media</h4>
                                <span className="text-xs text-[var(--color-primary)] cursor-pointer hover:underline">View All</span>
                            </div>
                            <div className="w-full bg-[#0D1117] rounded-xl p-8 border border-[var(--color-border)] flex flex-col items-center justify-center text-slate-500">
                                <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                                <span className="text-xs">No shared media yet.</span>
                            </div>
                        </div>

                        {/* Danger zone actions */}
                        <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors">
                            <Ban className="w-4 h-4" />
                            <span>Block Contact</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
