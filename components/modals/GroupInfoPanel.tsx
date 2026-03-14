"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { setGroupInfoOpen, addToast } from "@/store/slices/uiSlice";
import { addMemberThunk, removeMemberThunk, leaveGroupThunk } from "@/store/slices/chatThunks";
import { Avatar } from "@/components/shared/Avatar";
import {
    X,
    Shield,
    UserMinus,
    UserPlus,
    Search,
    LogOut,
    Pencil,
    Check,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

interface UserResult {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
}

/** Returns a deterministic hex accent from a user ID hash for sender name colouring. */
function senderColour(id: string): string {
    const palette = [
        "#a78bfa", "#34d399", "#60a5fa", "#f87171",
        "#fbbf24", "#f472b6", "#4ade80", "#38bdf8",
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
    return palette[hash % palette.length];
}

/** Slide-in panel from the right showing group details, members, and admin controls. */
export default function GroupInfoPanel() {
    const dispatch = useDispatch<AppDispatch>();
    const isOpen = useSelector((s: RootState) => s.ui.isGroupInfoOpen);
    const { activeChatId, chats } = useSelector((s: RootState) => s.chat);
    const { user } = useSelector((s: RootState) => s.auth);

    const chat = useMemo(
        () => chats.find((c) => c._id === activeChatId),
        [chats, activeChatId],
    );

    const isAdmin = chat?.admin === user?._id || chat?.admin?.toString() === user?._id;

    // — Editing group name (admin)
    const [editingName, setEditingName] = useState(false);
    const [nameVal, setNameVal] = useState(chat?.name || "");
    const [savingName, setSavingName] = useState(false);

    // — Confirm leave dialog
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [leaving, setLeaving] = useState(false);

    // — Add member search (admin)
    const [addSearchOpen, setAddSearchOpen] = useState(false);
    const [addQuery, setAddQuery] = useState("");
    const [addResults, setAddResults] = useState<UserResult[]>([]);
    const [addSearching, setAddSearching] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);
    const [removing, setRemoving] = useState<string | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const iconRef = useRef<HTMLInputElement>(null);
    const [groupIcon, setGroupIcon] = useState(chat?.icon || "");
    const [iconUploading, setIconUploading] = useState(false);

    const handleClose = () => dispatch(setGroupInfoOpen(false));

    const handleAddSearch = (val: string) => {
        setAddQuery(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (val.trim().length < 2) { setAddResults([]); return; }
        searchTimer.current = setTimeout(async () => {
            setAddSearching(true);
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(val.trim())}`);
                const data = await res.json();
                setAddResults(data?.users || data || []);
            } catch { setAddResults([]); }
            finally { setAddSearching(false); }
        }, 300);
    };

    const handleAddMember = async (userId: string) => {
        if (!activeChatId) return;
        setAdding(userId);
        const result = await dispatch(addMemberThunk({ chatId: activeChatId, userId }));
        setAdding(null);
        if (addMemberThunk.fulfilled.match(result)) {
            dispatch(addToast({ id: uuidv4(), message: "Member added.", type: "success" }));
            setAddQuery(""); setAddResults([]);
        } else {
            dispatch(addToast({ id: uuidv4(), message: (result.payload as string) || "Failed to add member.", type: "error" }));
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!activeChatId) return;
        setRemoving(userId);
        const result = await dispatch(removeMemberThunk({ chatId: activeChatId, userId }));
        setRemoving(null);
        if (!removeMemberThunk.fulfilled.match(result)) {
            dispatch(addToast({ id: uuidv4(), message: (result.payload as string) || "Failed to remove member.", type: "error" }));
        }
    };

    const handleLeave = async () => {
        if (!activeChatId) return;
        setLeaving(true);
        const result = await dispatch(leaveGroupThunk(activeChatId));
        setLeaving(false);
        if (leaveGroupThunk.fulfilled.match(result)) {
            dispatch(addToast({ id: uuidv4(), message: "You left the group.", type: "info" }));
            dispatch(setGroupInfoOpen(false));
        } else {
            dispatch(addToast({ id: uuidv4(), message: "Failed to leave group.", type: "error" }));
        }
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIconUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/media/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (res.ok && data.url) setGroupIcon(data.url);
        } catch {
            dispatch(addToast({ id: uuidv4(), message: "Icon upload failed.", type: "error" }));
        } finally { setIconUploading(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="group-info-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.aside
                        key="group-info-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
                        className="fixed right-0 top-0 h-full w-full md:w-[340px] z-50 flex flex-col overflow-hidden shadow-2xl"
                        style={{ background: "#111B22" }}
                    >
                        {/* Header */}
                        <div
                            className="h-16 shrink-0 flex items-center gap-3 px-4 border-b"
                            style={{ borderColor: "#2A3942" }}
                        >
                            <button
                                onClick={handleClose}
                                className="p-1.5 rounded-full hover:bg-white/8 transition text-slate-400 hover:text-white"
                                aria-label="Close group info"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-[15px] font-semibold text-slate-100 tracking-tight">
                                Group Info
                            </h2>
                        </div>

                        <div
                            className="flex-1 overflow-y-auto"
                            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
                        >
                            {/* Group Identity Section */}
                            <div
                                className="flex flex-col items-center pt-8 pb-6 px-6 border-b"
                                style={{ borderColor: "#2A3942" }}
                            >
                                <div className="relative mb-4">
                                    <div className="w-[84px] h-[84px] rounded-full overflow-hidden bg-white/5 flex items-center justify-center shadow-xl  ring-white/5">
                                        {groupIcon ? (
                                            <img src={groupIcon} alt="Group icon" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="size-full bg-gradient-to-br from-(--primary)/20 to-transparent flex items-center justify-center">
                                                <span className="text-3xl font-bold text-(--primary)">
                                                    {chat?.name?.[0]?.toUpperCase() || "G"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => iconRef.current?.click()}
                                            className="absolute -bottom-1 -right-1 size-7 bg-(--primary) text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all border-2 border-[#111B22]"
                                        >
                                            {iconUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
                                        </button>
                                    )}
                                    <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                                </div>

                                {/* Group name — editable for admin */}
                                <div className="w-full text-center">
                                    {editingName ? (
                                        <div className="flex items-center gap-2 justify-center">
                                            <input
                                                autoFocus
                                                value={nameVal}
                                                onChange={(e) => setNameVal(e.target.value)}
                                                className="bg-[#1E2A35] border border-[#2A3942] rounded-lg px-3 py-1.5 text-[16px] font-bold text-white text-center focus:outline-none focus: focus:ring-(--primary)/50 w-full max-w-[220px]"
                                                maxLength={50}
                                            />
                                            <button
                                                disabled={savingName}
                                                onClick={() => setEditingName(false)}
                                                className="size-8 rounded-full bg-(--primary) text-black flex items-center justify-center hover:opacity-90 transition-all shadow-lg shrink-0"
                                            >
                                                {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 justify-center group/name">
                                            <h3 className="text-[18px] font-bold text-slate-100 mb-1 leading-tight">{chat?.name}</h3>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => { setNameVal(chat?.name || ""); setEditingName(true); }}
                                                    className="size-6 rounded-full text-slate-500 hover:text-(--primary) hover:bg-white/5 transition-all opacity-0 group-hover/name:opacity-100 flex items-center justify-center"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center gap-1 mt-1">
                                        <p className="text-[13px] font-medium text-[var(--color-primary)]">
                                            {chat?.participants?.length ?? 0} Global Members
                                        </p>
                                        {(chat as any)?.createdAt && (
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                Created {format(new Date((chat as any).createdAt), "dd MMM yyyy")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Participants */}
                            <div className="border-b" style={{ borderColor: "#2A3942" }}>
                                <div className="flex items-center justify-between px-6 pt-5 pb-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>
                                        Participants
                                    </p>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setAddSearchOpen((v) => !v)}
                                            className="text-[12px] font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            Add Member
                                        </button>
                                    )}
                                </div>

                                {/* Add member search (admin only) */}
                                <AnimatePresence>
                                    {isAdmin && addSearchOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
                                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="relative group p-1">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-(--primary) transition-colors" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Find someone to add…"
                                                    value={addQuery}
                                                    onChange={(e) => handleAddSearch(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 bg-[#1E2A35] border border-[#2A3942] rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-(--primary)/40 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-1 mt-3 px-1">
                                                {addSearching && (
                                                    <div className="flex justify-center py-4">
                                                        <Loader2 className="size-5 animate-spin text-slate-600" />
                                                    </div>
                                                )}
                                                {addResults.map((u) => {
                                                    const already = chat?.participants?.some(
                                                        (p: any) => (typeof p === "object" ? p._id : p) === u._id,
                                                    );
                                                    return (
                                                        <button
                                                            key={u._id}
                                                            disabled={!!already || adding === u._id}
                                                            onClick={() => handleAddMember(u._id)}
                                                            className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white/4 rounded-xl text-left transition-all group disabled:opacity-50"
                                                        >
                                                            <Avatar name={u.name} src={u.avatar} className="size-10  ring-white/5" />
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-bold text-slate-200 truncate">{u.name}</p>
                                                                <p className="text-[10px] text-slate-500 truncate uppercase">{u.email}</p>
                                                            </div>
                                                            {adding === u._id ? (
                                                                <Loader2 className="size-4 animate-spin text-(--primary)" />
                                                            ) : already ? (
                                                                <Check className="size-4 text-slate-600" />
                                                            ) : (
                                                                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                                    <UserPlus className="size-4 text-(--primary)" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Participants List */}
                                <div className="space-y-0.5 mt-2">
                                    {chat?.participants?.map((p: any) => {
                                        const id: string = typeof p === "object" ? p._id : p;
                                        const name: string = typeof p === "object" ? p.name : "";
                                        const avatar: string | undefined = typeof p === "object" ? p.avatar : undefined;
                                        const isOnline: boolean = typeof p === "object" ? p.isOnline : false;
                                        const isChatAdmin = chat.admin === id || chat.admin?.toString() === id;
                                        const isMe = user?._id === id;

                                        return (
                                            <div
                                                key={id}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/4 transition-all group/row border border-transparent"
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <Avatar name={name} src={avatar} className="size-10  ring-white/5" />
                                                    {isOnline && (
                                                        <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-(--primary) border-2 border-[#090D13] shadow-sm" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-200 truncate">
                                                            {name} {isMe && <span className="text-slate-500 font-normal opacity-70 ml-0.5">/ You</span>}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {isChatAdmin ? (
                                                            <span className="flex items-center gap-1 text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md px-1.5 py-0.5 font-black uppercase tracking-widest">
                                                                <Shield className="size-2.5" /> Admin
                                                            </span>
                                                        ) : (
                                                            <span className="text-[8px] bg-white/5 text-slate-500 rounded-md px-1.5 py-0.5 font-black uppercase tracking-widest opacity-80  ring-white/10">
                                                                Member
                                                            </span>
                                                        )}
                                                        <span className={`text-[9px] font-bold ${isOnline ? 'text-(--primary)/60' : 'text-slate-600'}`}>
                                                            {isOnline ? "Online" : "Offline"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Admin specific controls */}
                                                {isAdmin && !isMe && (
                                                    <button
                                                        onClick={() => handleRemoveMember(id)}
                                                        disabled={removing === id}
                                                        className="size-8 rounded-lg transition-all opacity-0 group-hover/row:opacity-100 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/10"
                                                        title="Remove from group"
                                                    >
                                                        {removing === id ? (
                                                            <Loader2 className="size-3.5 animate-spin" />
                                                        ) : (
                                                            <UserMinus className="size-4" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section: Danger actions */}
                            <div className="px-6 py-5">
                                <button
                                    onClick={() => setConfirmLeave(true)}
                                    className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl text-[13px] font-semibold border transition-colors"
                                    style={{ borderColor: "rgba(235,64,52,0.35)", color: "#EB4034" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(235,64,52,0.08)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Leave Group
                                </button>
                            </div>
                        </div>

                        {/* Leave confirmation overlay */}
                        <AnimatePresence>
                            {confirmLeave && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-[60] flex flex-col items-center justify-center px-10 gap-8"
                                    style={{ background: "rgba(17,27,34,0.98)", backdropFilter: "blur(8px)" }}
                                >
                                    <div className="size-20 rounded-full bg-[#1E2A35] flex items-center justify-center  ring-red-500/20 shadow-2xl">
                                        <LogOut className="size-8 text-red-500" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="text-[18px] font-bold text-slate-100">Leave "{chat?.name}"?</h4>
                                        <p className="text-[13px] text-slate-400 leading-relaxed">
                                            Are you sure? You will lose access to previous messages and will need an invite to rejoin.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 w-full">
                                        <button
                                            onClick={handleLeave}
                                            disabled={leaving}
                                            className="w-full h-12 text-[14px] font-bold text-white bg-red-600 rounded-xl shadow-lg shadow-red-600/10 hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {leaving ? <Loader2 className="size-5 animate-spin" /> : <>Confirm Leave</>}
                                        </button>
                                        <button
                                            onClick={() => setConfirmLeave(false)}
                                            className="w-full h-12 text-[14px] font-semibold text-slate-400 hover:text-white transition-all rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
