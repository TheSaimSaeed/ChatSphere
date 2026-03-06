"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Avatar } from "@/components/shared/Avatar";

/** Displays the narrow navigation sidebar with app icon, menu items, and user profile. */
export default function NarrowSidebar() {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <aside className="w-16 flex flex-col items-center py-6 bg-(--color-bg-base) border-r border-(--color-border) justify-between flex-shrink-0">
            <div className="flex flex-col items-center gap-8 w-full">
                <div className="size-10 bg-(--color-primary) rounded-xl flex items-center justify-center text-black">
                    <span className="material-symbols-outlined text-2xl font-bold">bubble_chart</span>
                </div>
                <nav className="flex flex-col gap-6 w-full items-center">
                    <div className="group relative cursor-pointer text-(--color-primary)">
                        <span className="material-symbols-outlined text-[28px] fill-1">chat_bubble</span>
                        <div className="absolute left-14 bg-(--color-bg-surface) text-(--color-text-primary) px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Chats</div>
                    </div>
                    <div className="group relative cursor-pointer text-(--color-text-secondary) hover:text-(--color-primary) transition-colors">
                        <span className="material-symbols-outlined text-[28px]">group</span>
                        <div className="absolute left-14 bg-(--color-bg-surface) text-(--color-text-primary) px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Groups</div>
                    </div>
                    <div className="group relative cursor-pointer text-(--color-text-secondary) hover:text-(--color-primary) transition-colors">
                        <span className="material-symbols-outlined text-[28px]">call</span>
                        <div className="absolute left-14 bg-(--color-bg-surface) text-(--color-text-primary) px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Calls</div>
                    </div>
                    <div className="group relative cursor-pointer text-(--color-text-secondary) hover:text-(--color-primary) transition-colors">
                        <span className="material-symbols-outlined text-[28px]">bookmark</span>
                        <div className="absolute left-14 bg-(--color-bg-surface) text-(--color-text-primary) px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Bookmarks</div>
                    </div>
                </nav>
            </div>
            <div className="flex flex-col items-center gap-6 w-full">
                <div className="group relative cursor-pointer text-(--color-text-secondary) hover:text-(--color-primary) transition-colors">
                    <span className="material-symbols-outlined text-[28px]">settings</span>
                </div>
                <div className="size-10 rounded-full border-2 border-(--color-primary)/50 overflow-hidden cursor-pointer">
                    <Avatar name={user?.name || "User"} src={user?.avatar} className="w-full h-full" />
                </div>
            </div>
        </aside>
    );
}