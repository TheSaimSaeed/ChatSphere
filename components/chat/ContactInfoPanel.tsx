"use client";

import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { setContactInfoOpen } from "@/store/slices/uiSlice";
import { Avatar } from "@/components/shared/Avatar";
import { X, Phone, Mail, Ban, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

/** Slide-in panel that displays detailed contact information for the active DM conversation. */
export default function ContactInfoPanel() {
    const dispatch = useDispatch<AppDispatch>();
    const { isContactInfoOpen } = useSelector((state: RootState) => state.ui);
    const { activeChatId, chats } = useSelector((state: RootState) => state.chat);
    const { user } = useSelector((state: RootState) => state.auth);

    const activeChat = useMemo(
        () => chats.find((c) => c._id === activeChatId),
        [activeChatId, chats]
    );

    if (!user || !activeChat || activeChat.isGroup) return null;

    const contact = activeChat.participants.find((p: any) => p._id !== user._id);
    if (!contact) return null;

    // ── Presence text ──────────────────────────────────────────────────────
    let presenceLabel = "Offline";
    let presenceColor = "text-slate-400";

    if (contact.isOnline) {
        presenceLabel = "Active Now";
        presenceColor = "text-[var(--color-online)]";
    } else if (contact.lastSeen) {
        const lastSeenDate = new Date(contact.lastSeen);
        presenceColor = "text-slate-400";
        if (isToday(lastSeenDate)) {
            presenceLabel = `Last seen today at ${format(lastSeenDate, "HH:mm")}`;
        } else if (isYesterday(lastSeenDate)) {
            presenceLabel = "Last seen yesterday";
        } else if (differenceInDays(new Date(), lastSeenDate) < 7) {
            presenceLabel = `Last seen ${format(lastSeenDate, "EEEE")}`;
        } else {
            presenceLabel = `Last seen ${format(lastSeenDate, "dd MMM")}`;
        }
    }

    return (
        <AnimatePresence>
            {isContactInfoOpen && (
                <motion.div
                    key="contact-info-panel"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                    className="absolute top-0 right-0 h-full w-full md:w-[340px] z-50 flex flex-col"
                    style={{ background: "#111B22" }}
                >
                    {/* ── Top Header bar ──────────────────────────────────────── */}
                    <div
                        className="h-16 shrink-0 flex items-center gap-3 px-4 border-b"
                        style={{ borderColor: "#2A3942" }}
                    >
                        <button
                            onClick={() => dispatch(setContactInfoOpen(false))}
                            className="p-1.5 rounded-full hover:bg-white/8 transition text-slate-400 hover:text-white"
                            aria-label="Close contact info"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-[15px] font-semibold text-slate-100 tracking-tight">
                            Contact Info
                        </h2>
                    </div>

                    {/* ── Scrollable body ─────────────────────────────────────── */}
                    <div
                        className="flex-1 overflow-y-auto"
                        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
                    >
                        {/* ── Hero section ─────────────────────────────────────── */}
                        <div
                            className="flex flex-col items-center pt-8 pb-6 px-6 border-b"
                            style={{ borderColor: "#2A3942" }}
                        >
                            {/* Avatar with optional online ring */}
                            <div className="relative mb-4">
                                <Avatar
                                    name={contact.name}
                                    src={contact.avatar}
                                    className="w-[84px] h-[84px] rounded-full shadow-xl"
                                />
                                {contact.isOnline && (
                                    <span
                                        className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-[2.5px]"
                                        style={{
                                            background: "var(--color-online)",
                                            borderColor: "#111B22",
                                        }}
                                    />
                                )}
                            </div>

                            {/* Name */}
                            <h3 className="text-[18px] font-bold text-slate-100 mb-1 text-center leading-tight">
                                {contact.name}
                            </h3>

                            {/* Presence */}
                            <p className={`text-[13px] font-medium ${presenceColor}`}>
                                {presenceLabel}
                            </p>

                            {/* Status message / bio */}
                            {contact.statusMessage && (
                                <p className="mt-3 text-[13px] text-slate-400 text-center italic leading-relaxed max-w-[240px]">
                                    &ldquo;{contact.statusMessage}&rdquo;
                                </p>
                            )}
                        </div>

                        {/* ── Contact Details ───────────────────────────────────── */}
                        <div
                            className="border-b"
                            style={{ borderColor: "#2A3942" }}
                        >
                            <p
                                className="px-6 pt-5 pb-2 text-[11px] font-semibold uppercase tracking-widest"
                                style={{ color: "var(--color-primary)" }}
                            >
                                Contact Details
                            </p>

                            {/* Phone row */}
                            {contact.phone ? (
                                <div className="flex items-center gap-4 px-6 py-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: "#1E2A35" }}
                                    >
                                        <Phone className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">
                                            Phone Number
                                        </span>
                                        <span className="text-[13px] text-slate-200">
                                            {contact.phone}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 px-6 py-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: "#1E2A35" }}
                                    >
                                        <Phone className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">
                                            Phone Number
                                        </span>
                                        <span className="text-[13px] text-slate-500 italic">
                                            Not provided
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            <div className="mx-6 my-0 h-px" style={{ background: "#2A3942" }} />

                            {/* Email row */}
                            <div className="flex items-center gap-4 px-6 py-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: "#1E2A35" }}
                                >
                                    <Mail className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">
                                        Email
                                    </span>
                                    <span className="text-[13px] text-slate-200 break-all">
                                        {contact.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Shared Media ──────────────────────────────────────── */}
                        <div
                            className="border-b"
                            style={{ borderColor: "#2A3942" }}
                        >
                            <div className="flex items-center justify-between px-6 pt-5 pb-2">
                                <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
                                    Shared Media
                                </p>
                                <button className="text-[12px] font-medium text-slate-400 hover:text-white transition-colors">
                                    View All
                                </button>
                            </div>

                            {/* Placeholder grid */}
                            <div className="px-6 pb-5">
                                <div
                                    className="w-full rounded-xl p-6 flex flex-col items-center justify-center gap-2 border"
                                    style={{ background: "#0E1621", borderColor: "#2A3942" }}
                                >
                                    <ImageIcon className="w-8 h-8 text-slate-600" />
                                    <span className="text-[12px] text-slate-500">
                                        No shared media yet.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── Danger zone ───────────────────────────────────────── */}
                        <div className="px-6 py-5">
                            <button className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-[13px] font-semibold border transition-colors"
                                style={{ borderColor: "rgba(235,64,52,0.35)", color: "#EB4034" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(235,64,52,0.08)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                                <Ban className="w-4 h-4" />
                                Block Contact
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
