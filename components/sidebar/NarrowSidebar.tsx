"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { usePathname, useRouter } from "next/navigation";

/** Displays the narrow navigation sidebar with app icon, menu items, and user profile. */
export default function NarrowSidebar() {
    const { user } = useSelector((state: RootState) => state.auth);
    const pathname = usePathname();
    const router = useRouter();

    const isChat = pathname.startsWith('/chat');
    const isProfile = pathname.startsWith('/profile');

    return (
        <aside className="w-16 flex flex-col items-center py-6 bg-(--nav-bg) border-r border-white/5 justify-between shrink-0 h-full">
            <div className="flex flex-col items-center gap-8 w-full">
                {/* App Logo */}
                <div className="size-10 bg-(--primary) rounded-xl flex items-center justify-center text-black shrink-0">
                    <span className="material-symbols-outlined text-2xl font-bold">bubble_chart</span>
                </div>
                <nav className="flex flex-col gap-6 w-full items-center">
                    {/* Chats */}
                    <button
                        onClick={() => router.push('/chat')}
                        className={`group relative cursor-pointer transition-colors ${isChat ? 'text-(--primary)' : 'text-slate-500 hover:text-(--primary)'}`}
                    >
                        <span className={`material-symbols-outlined text-[28px] ${isChat ? 'fill-1' : ''}`}>chat_bubble</span>
                        <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Chats</div>
                    </button>
                    {/* Groups – placeholder, wired in Slice 8 */}
                    <button className="group relative cursor-pointer text-slate-500 hover:text-(--primary) transition-colors">
                        <span className="material-symbols-outlined text-[28px]">group</span>
                        <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Groups</div>
                    </button>
                    {/* Calls – placeholder */}
                    <button className="group relative cursor-pointer text-slate-500 hover:text-(--primary) transition-colors">
                        <span className="material-symbols-outlined text-[28px]">call</span>
                        <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Calls</div>
                    </button>
                </nav>
            </div>

            <div className="flex flex-col items-center gap-5 w-full">
                {/* Settings */}
                <button className="group relative cursor-pointer text-slate-500 hover:text-(--primary) transition-colors">
                    <span className="material-symbols-outlined text-[28px]">settings</span>
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Settings</div>
                </button>
                {/* Profile Avatar — navigates to /profile */}
                <button
                    onClick={() => router.push('/profile')}
                    title="My Profile"
                    className={`shrink-0 size-10 rounded-full overflow-hidden transition-all ${isProfile ? 'ring-2 ring-(--primary) ring-offset-2 ring-offset-(--nav-bg)' : 'ring-2 ring-(--primary)/30 hover:ring-(--primary)/70'}`}
                >
                    {user?.avatar ? (
                        <img alt={user.name} className="w-full h-full object-cover" src={user.avatar} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-(--primary)/20 text-(--primary) font-bold text-sm">
                            {user?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
}