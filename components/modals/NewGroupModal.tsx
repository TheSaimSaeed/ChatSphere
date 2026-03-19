"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean | null>(null);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);
    // Default to true during SSR to avoid mobile view flash on desktop
    return matches === null ? true : matches;
}


import { motion, AnimatePresence } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { setNewGroupModalOpen } from "@/store/slices/uiSlice";
import { createGroupThunk } from "@/store/slices/chatThunks";
import { addToast } from "@/store/slices/uiSlice";
import { Avatar } from "@/components/shared/Avatar";
import { X, Search, ArrowRight, Users, Loader2, ImagePlus, Camera, Pencil, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";

interface UserResult {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
}

/** Determines a deterministic Tailwind colour class for a user's chip based on their ID. */
function chipColour(id: string): string {
    const colours = [
        "bg-violet-500/20 text-violet-300 border-violet-500/30",
        "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        "bg-sky-500/20 text-sky-300 border-sky-500/30",
        "bg-rose-500/20 text-rose-300 border-rose-500/30",
        "bg-amber-500/20 text-amber-300 border-amber-500/30",
        "bg-pink-500/20 text-pink-300 border-pink-500/30",
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
    return colours[hash % colours.length];
}

/** Two-step modal for creating a new group chat — step 1 selects members, step 2 sets name and icon. */
export default function NewGroupModal() {
    const dispatch = useDispatch<AppDispatch>();
    const isOpen = useSelector((s: RootState) => s.ui.isNewGroupModalOpen);
    const { user } = useSelector((s: RootState) => s.auth);
    const { chats } = useSelector((s: RootState) => s.chat);

    const [step, setStep] = useState<1 | 2>(1);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selected, setSelected] = useState<UserResult[]>([]);
    const [groupName, setGroupName] = useState("");
    const [groupIcon, setGroupIcon] = useState<string>("");
    const [iconUploading, setIconUploading] = useState(false);
    const [creating, setCreating] = useState(false);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleClose = useCallback(() => {
        dispatch(setNewGroupModalOpen(false));
        setTimeout(() => {
            setStep(1);
            setQuery("");
            setResults([]);
            setSelected([]);
            setGroupName("");
            setGroupIcon("");
            setCreating(false);
        }, 300);
    }, [dispatch]);

    const handleSearch = useCallback((val: string) => {
        setQuery(val);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (val.trim().length < 2) {
            setResults([]);
            return;
        }
        searchTimer.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/users/search?q=${encodeURIComponent(val.trim())}`);
                const data = await res.json();
                setResults(data?.users || data || []);
            } catch {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
    }, []);

    const handleSelect = (user: UserResult) => {
        if (!selected.find((s) => s._id === user._id)) {
            setSelected((prev) => [...prev, user]);
        }
        setQuery("");
        setResults([]);
    };

    const handleRemove = (userId: string) => {
        setSelected((prev) => prev.filter((s) => s._id !== userId));
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIconUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/media/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok && data.url) setGroupIcon(data.url);
        } catch {
            dispatch(addToast({ id: uuidv4(), message: "Icon upload failed.", type: "error" }));
        } finally {
            setIconUploading(false);
        }
    };
    const handleCreate = async () => {
        if (!groupName.trim() || selected.length < 1) return;
        setCreating(true);
        const result = await dispatch(
            createGroupThunk({
                name: groupName.trim(),
                participants: selected.map((s) => s._id),
                icon: groupIcon || undefined,
            }),
        );
        setCreating(false);
        if (createGroupThunk.fulfilled.match(result)) {
            dispatch(addToast({ id: uuidv4(), message: "Group created.", type: "success" }));
            handleClose();
        } else {
            dispatch(
                addToast({ id: uuidv4(), message: "Failed to create group.", type: "error" }),
            );
        }
    };

    const recentContacts = useMemo(() => {
        const contacts: UserResult[] = [];
        const seenIds = new Set<string>();
        chats.forEach((c: any) => {
            if (!c.isGroup) {
                const other = c.participants.find((p: any) => p._id !== user?._id);
                if (other && !seenIds.has(other._id)) {
                    contacts.push({
                        _id: other._id,
                        name: other.name,
                        email: other.email || "",
                        avatar: other.avatar,
                        isOnline: other.isOnline,
                    });
                    seenIds.add(other._id);
                }
            }
        });
        return contacts;
    }, [chats, user]);

    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className={isDesktop 
                ? "bg-[#0D1117]/95 backdrop-blur-xl border border-white/10 text-slate-100 max-w-md p-0 overflow-hidden rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]" 
                : "fixed inset-0 m-0 p-0 top-0 left-0 w-full h-[100dvh] max-w-none transform-none !translate-x-0 !translate-y-0 bg-[#0a151a] border-none text-[#d9e4ec] rounded-none shadow-none flex flex-col z-[100] sm:rounded-none"}>
                
                {isDesktop ? (
                    // ==========================================
                    // DESKTOP VIEW - PRESERVED EXACTLY AS IT WAS
                    // ==========================================
                    <div className="flex flex-col h-full overflow-hidden">
                        <DialogHeader className="px-8 pt-8 pb-4">
                            <DialogTitle className="flex items-center gap-4 text-xl font-bold text-white">
                                <div className="size-11 rounded-2xl bg-[--primary]/10 flex items-center justify-center border border-[--primary]/20">
                                    <Users className="w-5 h-5 text-[--primary]" />
                                </div>
                                <div className="flex flex-col">
                                    <span>{step === 1 ? "Add Members" : "Group Details"}</span>
                                    <span className="text-xs font-normal text-slate-500">Step {step} of 2</span>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="relative overflow-hidden min-h-[480px]">
                            <AnimatePresence mode="wait" initial={false}>
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "circOut" }}
                                        className="px-8 pb-8 flex flex-col gap-6"
                                    >
                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[--primary] transition-colors" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Find people for your group…"
                                                    value={query}
                                                    onChange={(e) => handleSearch(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[--primary]/50 focus:ring-1 focus:ring-[--primary]/20 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        {selected.length > 0 && (
                                            <div className="flex gap-4 overflow-x-auto pb-2 px-1 custom-scrollbar min-h-[85px]">
                                                <AnimatePresence>
                                                    {selected.map((u) => (
                                                        <motion.div
                                                            key={u._id}
                                                            layout
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0.5, opacity: 0 }}
                                                            className="flex flex-col items-center gap-1.5 shrink-0 relative group/preview"
                                                        >
                                                            <div className="relative">
                                                                <Avatar name={u.name} src={u.avatar} className="size-14 ring-white/5 group-hover/preview:ring-[--primary]/30 transition-all" />
                                                                <button
                                                                    onClick={() => handleRemove(u._id)}
                                                                    className="absolute -top-1 -right-1 size-5 bg-[#1C2431] text-white rounded-full flex items-center justify-center border border-white/10 hover:bg-red-500 transition-colors shadow-lg"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-400 truncate w-14 text-center">{u.name.split(' ')[0]}</span>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        <div className="flex-1 min-h-[220px] flex flex-col">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">
                                                {query.trim() ? "Search Results" : "Recent Contacts"}
                                            </p>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-1 max-h-[240px]">
                                                {searching ? (
                                                    <div className="flex justify-center py-8">
                                                        <Loader2 className="w-6 h-6 animate-spin text-[--primary]/60" />
                                                    </div>
                                                ) : (
                                                    (query.trim() ? results : recentContacts).map((u: UserResult) => {
                                                        const isSelected = selected.some((s) => s._id === u._id);
                                                        return (
                                                            <button
                                                                key={u._id}
                                                                onClick={() => isSelected ? handleRemove(u._id) : handleSelect(u)}
                                                                className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-white/5 transition-all text-left relative group/item"
                                                            >
                                                                <div className="relative flex-shrink-0">
                                                                    <Avatar name={u.name} src={u.avatar} className="size-11 " />
                                                                    {u.isOnline && (
                                                                        <div className="absolute bottom-0 right-0 size-3 bg-[--primary] border-2 border-[#0D1117] rounded-full" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-slate-200 truncate">{u.name}</p>
                                                                    <p className={`text-[10px] uppercase font-bold tracking-tighter ${u.isOnline ? 'text-[--primary]/70' : 'text-slate-500'}`}>
                                                                        {u.isOnline ? 'Online' : 'Offline'}
                                                                    </p>
                                                                </div>
                                                                <div className={`size-6 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-[--primary] border-[--primary] text-black shadow-lg shadow-[--primary]/20' : 'border-white/10 group-hover/item:border-[--primary]/50 text-transparent'}`}>
                                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}

                                                {(!searching && (query.trim() ? results : recentContacts).length === 0) && (
                                                    <div className="flex flex-col items-center justify-center py-10 text-slate-500/50 gap-2">
                                                        <Users className="w-8 h-8 opacity-20" />
                                                        <p className="text-xs">{query.trim() ? "No users found" : "No recent contacts"}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{selected.length} Selected</span>
                                                <span className="text-[10px] text-slate-500  tracking-tighter">At least 1 member required</span>
                                            </div>
                                            <button
                                                disabled={selected.length < 1}
                                                onClick={() => setStep(2)}
                                                className="stitch-btn px-8 py-3"
                                            >
                                                Continue <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 20, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "circOut" }}
                                        className="px-8 pb-8 flex flex-col gap-8 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[--primary]/5 blur-[80px] -z-10" />

                                        <div className="flex flex-col items-center gap-6 py-2">
                                            <div className="relative group">
                                                <button
                                                    onClick={() => fileRef.current?.click()}
                                                    className="size-28 rounded-[60%] bg-white/5 border border-white/10 hover:border-[--primary]/50 flex items-center justify-center transition-all overflow-hidden shadow-2xl ring-1 ring-white/5"
                                                >
                                                    {iconUploading ? (
                                                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                                    ) : groupIcon ? (
                                                        <img src={groupIcon} alt="Group icon" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                                                            <ImagePlus className="w-8 h-8 opacity-40" />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">Add Icon</span>
                                                        </div>
                                                    )}
                                                </button>
                                                {groupIcon && (
                                                    <button
                                                        onClick={() => setGroupIcon("")}
                                                        className="absolute -top-2 -right-2 size-8 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors border-4 border-[#0D1117]"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => fileRef.current?.click()}
                                                    className="absolute -bottom-2 -right-2 size-9 bg-[--primary] text-black rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all border-4 border-[#0D1117]"
                                                >
                                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-md ring-4 ring-[#0D1117] transition-transform group-hover:scale-110 z-20">
                                                        <Camera className="w-4 h-4 text-black" />
                                                    </div>
                                                </button>
                                                <input
                                                    ref={fileRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleIconUpload}
                                                />
                                            </div>

                                            <div className="w-full space-y-2">
                                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Group Name</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Enter a descriptive team name…"
                                                    value={groupName}
                                                    onChange={(e) => setGroupName(e.target.value)}
                                                    maxLength={50}
                                                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[--primary]/50 focus:ring-1 focus:ring-[--primary]/20 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between ml-1">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{selected.length} Participants</p>
                                                <button onClick={() => setStep(1)} className="text-xs text-[--primary] hover:underline">Edit List</button>
                                            </div>
                                            <div className="flex -space-x-3 p-1">
                                                {selected.slice(0, 10).map((u) => (
                                                    <Avatar
                                                        key={u._id}
                                                        name={u.name}
                                                        src={u.avatar}
                                                        className="size-9 ring-4 ring-[#0D1117] hover:-translate-y-1 transition-transform cursor-help"
                                                    />
                                                ))}
                                                {selected.length > 10 && (
                                                    <div className="size-9 rounded-full bg-white/10 ring-4 ring-[#0D1117] flex items-center justify-center text-xs text-slate-300 font-black relative z-10">
                                                        +{selected.length - 10}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                            >
                                                Go Back
                                            </button>
                                            <button
                                                disabled={!groupName.trim() || creating}
                                                onClick={handleCreate}
                                                className="stitch-btn flex-[1] py-3 text-sm"
                                            >
                                                {creating ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        Create Group <Users className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    // ==========================================
                    // MOBILE VIEW - STITCH DESIGN ONLY
                    // ==========================================
                    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-[#0a151a]">
                        <div className="flex flex-col px-6 pt-10 pb-4 shrink-0 bg-[#0a151a] relative z-20">
                            <div className="flex items-center gap-4 mb-2">
                                {step === 2 ? (
                                    <button onClick={() => setStep(1)} className="p-2 -ml-2 text-[#d9e4ec] active:scale-95">
                                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                                    </button>
                                ) : (
                                    <button onClick={handleClose} className="p-2 -ml-2 text-[#d9e4ec] active:scale-95">
                                        <span className="material-symbols-outlined text-[24px]">close</span>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                                <div className="size-12 rounded-full bg-[#1e2a33] flex items-center justify-center border border-white/5">
                                    <Users className="w-6 h-6 text-[#4ff07f]" />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-bold tracking-tight text-[#d9e4ec]">ChatSphere</h2>
                                    <span className="text-[10px] font-medium text-[#bbcbb9] tracking-wider uppercase">Create New Group</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex-1 flex flex-col min-h-0 bg-[#0a151a]">
                            <AnimatePresence mode="wait" initial={false}>
                                {step === 1 ? (
                                    <motion.div
                                        key="step1"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -20, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "circOut" }}
                                        className="flex flex-col flex-1 h-full min-h-0 relative"
                                    >
                                        <div className="px-6 mb-4 mt-2 shrink-0">
                                            <div className="relative group">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbcbb9]" />
                                                <input
                                                    type="text"
                                                    placeholder="Search participants..."
                                                    value={query}
                                                    onChange={(e) => handleSearch(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-4 bg-[#1e2a33] border-none rounded-xl text-base text-[#d9e4ec] placeholder:text-[#bbcbb9]/60 focus:outline-none focus:ring-1 focus:ring-[#4ff07f]/30 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        {selected.length > 0 && (
                                            <div className="flex gap-4 overflow-x-auto px-6 pb-4 custom-scrollbar shrink-0 border-b border-[#1e2a33]">
                                                <AnimatePresence>
                                                    {selected.map((u) => (
                                                        <motion.div
                                                            key={u._id}
                                                            layout
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0.5, opacity: 0 }}
                                                            className="flex flex-col items-center gap-2 shrink-0 relative"
                                                        >
                                                            <div className="relative">
                                                                <Avatar name={u.name} src={u.avatar} className="size-[60px] border-2 border-[#4ff07f]" />
                                                                <button
                                                                    onClick={() => handleRemove(u._id)}
                                                                    className="absolute -top-1 -right-1 size-5 bg-[#2c363d] text-[#ffb4ab] rounded-full flex items-center justify-center p-0 m-0 border border-[#0a151a]"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px] leading-none">cancel</span>
                                                                </button>
                                                            </div>
                                                            <span className="text-[12px] font-medium text-[#bbcbb9] truncate w-[60px] text-center">{u.name.split(' ')[0]}</span>
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        <div className="flex-1 overflow-y-auto px-6 pt-2 pb-24 h-full gap-2 custom-scrollbar">
                                            <p className="text-xs font-semibold text-[#bbcbb9] mb-3 sticky top-0 bg-[#0a151a] z-10 py-1">
                                                {query.trim() ? "Search Results" : "Suggested"}
                                            </p>
                                            {searching ? (
                                                <div className="flex justify-center py-8">
                                                    <Loader2 className="w-8 h-8 animate-spin text-[#4ff07f]/60" />
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {(query.trim() ? results : recentContacts).map((u: UserResult) => {
                                                        const isSelected = selected.some((s) => s._id === u._id);
                                                        return (
                                                            <button
                                                                key={u._id}
                                                                onClick={() => isSelected ? handleRemove(u._id) : handleSelect(u)}
                                                                className={`w-full flex items-center gap-4 py-3 px-4 rounded-2xl transition-all text-left ${isSelected ? 'bg-[#1e2a33]' : 'bg-transparent'}`}
                                                            >
                                                                <div className="relative flex-shrink-0">
                                                                    <Avatar name={u.name} src={u.avatar} className="size-[52px]" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[15px] font-semibold text-[#d9e4ec] truncate mb-0.5">{u.name}</p>
                                                                    <p className={`text-[12px] font-medium ${u.isOnline ? 'text-[#4ff07f]' : 'text-[#bbcbb9]/70'}`}>
                                                                        {u.isOnline ? 'Active now' : 'Offline'}
                                                                    </p>
                                                                </div>
                                                                <div className={`size-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'text-[#4ff07f]' : 'text-[#bbcbb9]/30'}`}>
                                                                    <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                                        {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-6 pt-4 bg-gradient-to-t from-[#0a151a] via-[#0a151a]/95 to-transparent">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-bold text-[#d9e4ec] tracking-tight">{selected.length} Selected</span>
                                                </div>
                                                <button
                                                    disabled={selected.length < 1}
                                                    onClick={() => setStep(2)}
                                                    className="bg-[#1e2a33] text-[#4ff07f] disabled:opacity-50 px-6 py-3 rounded-full flex items-center justify-center transition-all active:scale-95"
                                                >
                                                    <span className="font-semibold text-sm mr-2">Next</span>
                                                    <span className="material-symbols-outlined text-[18px] font-bold">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="step2"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 20, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: "circOut" }}
                                        className="flex flex-col flex-1 h-full px-6"
                                    >
                                        <div className="flex flex-col items-center gap-6 mt-4">
                                            <div className="relative group cursor-pointer w-full flex justify-center">
                                                <button
                                                    onClick={() => fileRef.current?.click()}
                                                    className="size-[120px] rounded-full bg-[#1e2a33] border border-[#2c363d] flex flex-col items-center justify-center transition-all overflow-hidden"
                                                >
                                                    {iconUploading ? (
                                                        <Loader2 className="w-8 h-8 animate-spin text-[#bbcbb9]" />
                                                    ) : groupIcon ? (
                                                        <img src={groupIcon} alt="Group icon" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-[#bbcbb9]">
                                                            <ImagePlus className="w-8 h-8" />
                                                            <span className="text-[10px] font-semibold tracking-wide">Add Icon</span>
                                                        </div>
                                                    )}
                                                </button>
                                                {groupIcon && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setGroupIcon(""); }}
                                                        className="absolute top-0 right-1/4 size-8 bg-[#2c363d] text-[#ffb4ab] rounded-full flex items-center justify-center border-4 border-[#0a151a]"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <input
                                                    ref={fileRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleIconUpload}
                                                />
                                            </div>

                                            <div className="w-full mt-4">
                                                <input
                                                    type="text"
                                                    placeholder="Enter group name..."
                                                    value={groupName}
                                                    onChange={(e) => setGroupName(e.target.value)}
                                                    maxLength={50}
                                                    className="w-full px-5 py-4 bg-[#1e2a33] border-none rounded-xl text-base text-[#d9e4ec] placeholder:text-[#bbcbb9]/60 focus:outline-none focus:ring-1 focus:ring-[#4ff07f]/30 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-auto mb-6">
                                            <button
                                                disabled={!groupName.trim() || creating}
                                                onClick={handleCreate}
                                                className="w-full bg-gradient-to-tr from-[#4ff07f] to-[#25d366] text-[#0a151a] font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(79,240,127,0.2)] active:scale-95 transition-all duration-200"
                                            >
                                                {creating ? (
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                ) : (
                                                    <>
                                                        <span className="material-symbols-outlined font-bold text-[20px]">check</span>
                                                        <span className="text-[16px]">Create Group</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
