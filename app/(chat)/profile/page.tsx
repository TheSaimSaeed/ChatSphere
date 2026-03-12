"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft, Camera, Lock, LogOut, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/shared/Avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfileThunk, uploadMediaThunk, logoutThunk } from "@/store/slices/authThunks";
import { addToast } from "@/store/slices/uiSlice";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ── Skeleton loader shown while user session is being restored ──────────────
function ProfileSkeleton() {
    return (
        <div className="flex w-full h-full overflow-y-auto">
            <div className="max-w-[640px] w-full mx-auto p-4 md:p-8 flex flex-col pt-10 animate-pulse">
                <div className="h-8 w-48 bg-white/5 rounded-md mb-10" />
                <div className="flex flex-col items-center mb-10 gap-4">
                    <div className="w-24 h-24 rounded-full bg-white/10" />
                    <div className="h-3 w-48 bg-white/5 rounded" />
                </div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex flex-col gap-2 mb-5">
                        <div className="h-3 w-24 bg-white/5 rounded" />
                        <div className="h-11 w-full bg-white/5 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user, isLoading, isAuthenticated } = useAppSelector(state => state.auth);

    // Redirect to login if session check finished but no valid user was found
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);
    const { theme, setTheme } = useTheme();

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // ── Form state — seeded once user is available ─────────────────────────
    const [name, setName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [phone, setPhone] = useState("");
    const [avatar, setAvatar] = useState("");
    const [formReady, setFormReady] = useState(false);

    // Seed form values when user data arrives from Redux
    useEffect(() => {
        if (user && !formReady) {
            setName(user.name || "");
            setStatusMessage(user.statusMessage || "");
            setPhone(user.phone || "");
            setAvatar(user.avatar || "");
            setFormReady(true);
        }
    }, [user, formReady]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    // ── Derived flags ──────────────────────────────────────────────────────
    const hasChanges = useMemo(() => {
        if (!user) return false;
        return (
            name !== (user.name || "") ||
            statusMessage !== (user.statusMessage || "") ||
            phone !== (user.phone || "") ||
            avatar !== (user.avatar || "")
        );
    }, [name, statusMessage, phone, avatar, user]);

    const isSaveDisabled = !hasChanges || isSaving || !name.trim();

    // ── Preferences ────────────────────────────────────────────────────────
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [notifStatus, setNotifStatus] = useState<NotificationPermission>("default");

    useEffect(() => {
        if ('Notification' in window) setNotifStatus(Notification.permission);
        const stored = localStorage.getItem('chatsphere_sound');
        if (stored === 'false') setSoundEnabled(false);
    }, []);

    useEffect(() => {
        localStorage.setItem('chatsphere_sound', soundEnabled ? 'true' : 'false');
    }, [soundEnabled]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setIsUploading(true);
            const action = await dispatch(uploadMediaThunk(file));
            if (uploadMediaThunk.fulfilled.match(action)) {
                setAvatar(action.payload.url);
            } else {
                dispatch(addToast({ id: Date.now().toString(), type: 'error', message: 'Media upload failed.' }));
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (isSaveDisabled) return;
        setIsSaving(true);
        try {
            const action = await dispatch(updateProfileThunk({ name, statusMessage, phone, avatar }));
            if (updateProfileThunk.fulfilled.match(action)) {
                setJustSaved(true);
                dispatch(addToast({ id: Date.now().toString(), type: 'success', message: 'Profile updated.' }));
                setTimeout(() => setJustSaved(false), 2000);
            } else {
                dispatch(addToast({ id: Date.now().toString(), type: 'error', message: (action.payload as string) || 'Update failed' }));
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await dispatch(logoutThunk());
        router.push('/login');
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotifStatus(permission);
        }
    };

    // ── Guards ─────────────────────────────────────────────────────────────
    // While session is being restored, show skeleton
    if (isLoading) {
        return <ProfileSkeleton />;
    }
    // If session loaded but no user → redirect handled by useEffect above
    if (!user) {
        return <ProfileSkeleton />;
    }

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="flex w-full h-full overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            <div className="max-w-[640px] w-full mx-auto p-4 md:p-8 flex flex-col pt-10">

                {/* ── Header ── */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/chat')}
                        className="p-2 -ml-2 hover:bg-white/5 rounded-full transition text-slate-400 hover:text-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-100">Profile & Settings</h1>
                </div>

                {/* ── Avatar ── */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Avatar name={user.name} src={avatar || null} className="w-24 h-24 rounded-full" />
                        {isUploading && (
                            <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin z-10 pointer-events-none"
                                style={{ borderColor: 'var(--color-primary) transparent transparent transparent' }} />
                        )}
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-md ring-4 ring-[#0D1117] transition-transform group-hover:scale-110 z-20">
                            <Camera className="w-4 h-4 text-black" />
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleFileChange}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center">Click to change · JPG, PNG, GIF, WEBP · max 10 MB</p>
                </div>

                {/* ── Profile Fields ── */}
                <div className="flex flex-col gap-5 mb-8">

                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="h-11 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-slate-200 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition"
                        />
                        {!name.trim() && <span className="text-xs text-red-400">Full name is required.</span>}
                    </div>

                    {/* Email (read-only) */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={user.email}
                                disabled
                                className="h-11 w-full pl-10 pr-3 bg-white/5 border border-white/10 rounded-md text-sm text-slate-500 cursor-not-allowed"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        </div>
                    </div>

                    {/* Status Message */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-300">Status Message</label>
                            <span className="text-xs text-slate-500">{statusMessage.length}/100</span>
                        </div>
                        <Textarea
                            value={statusMessage}
                            onChange={e => setStatusMessage(e.target.value.slice(0, 100))}
                            placeholder="Hey there! I'm using ChatSphere"
                            rows={2}
                            className="resize-none px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-slate-200 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition"
                        />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">
                            Phone Number <span className="text-slate-500 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+923001234567"
                            className="h-11 px-3 bg-white/5 border border-white/10 rounded-md text-sm text-slate-200 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition"
                        />
                        <p className="text-xs text-slate-500">Stored for future features. Not verified.</p>
                    </div>
                </div>

                {/* ── Save Button ── */}
                <div className="mb-10">
                    <button
                        onClick={handleSave}
                        disabled={isSaveDisabled}
                        className={`w-full h-11 flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all ${justSaved
                            ? "bg-green-500 text-white"
                            : isSaveDisabled
                                ? "bg-white/5 text-slate-500 cursor-not-allowed"
                                : "bg-[var(--color-primary)] text-black hover:opacity-90"
                            }`}
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Saving…
                            </span>
                        ) : justSaved ? (
                            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Saved</span>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>

                <hr className="border-white/5 mb-10" />

                {/* ── Preferences ── */}
                <div className="flex flex-col gap-6 mb-10">
                    <h2 className="text-base font-semibold text-slate-100">Preferences</h2>

                    {/* Theme */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-300">Theme</label>
                        <div className="flex items-center gap-3">
                            <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
                                {mounted ? theme : ""}
                            </span>
                            <Switch
                                checked={mounted && theme === 'dark'}
                                onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>
                    </div>

                    {/* Sound Alerts */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-300">Sound Alerts</label>
                        <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                    </div>

                    {/* Browser Notifications */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-sm font-medium text-slate-300">Browser Notifications</label>
                        <div className="flex items-center gap-3">
                            {notifStatus === 'granted' && (
                                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20 font-medium">Enabled</span>
                            )}
                            {notifStatus === 'denied' && (
                                <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded border border-amber-500/20 font-medium">Blocked by browser</span>
                            )}
                            {notifStatus === 'default' && (
                                <>
                                    <span className="px-2 py-1 bg-slate-500/10 text-slate-400 text-xs rounded border border-slate-500/20 font-medium">Disabled</span>
                                    <button
                                        onClick={requestNotificationPermission}
                                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition"
                                    >
                                        Enable
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="border-red-500/20 mb-8" />

                {/* ── Danger Zone ── */}
                <div className="flex flex-col gap-3 mb-10">
                    <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Account</h2>
                    <button
                        onClick={handleLogout}
                        className="w-full h-11 mb-10 flex items-center justify-center gap-2 rounded-md text-sm font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

            </div>
        </div>
    );
}
