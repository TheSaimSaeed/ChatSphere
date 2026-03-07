"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Avatar } from "@/components/shared/Avatar";

/** Displays the narrow navigation sidebar with app icon, menu items, and user profile. */
export default function NarrowSidebar() {
    const { user } = useSelector((state: RootState) => state.auth);

    return (
        <aside className="w-16 flex flex-col items-center py-6 bg-(--nav-bg) border-r border-white/5 justify-between shrink-0 h-full">
            <div className="flex flex-col items-center gap-8 w-full">
                <div className="size-10 bg-(--primary) rounded-xl flex items-center justify-center text-black">
                    <span className="material-symbols-outlined text-2xl font-bold">bubble_chart</span>
                </div>
                <nav className="flex flex-col gap-6 w-full items-center">
                    <div className="group relative cursor-pointer text-(--primary)">
                        <span className="material-symbols-outlined text-[28px] fill-1">chat_bubble</span>
                        <div className="absolute left-14 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Chats</div>
                    </div>
                    <div className="group relative cursor-pointer text-slate-500 hover:text-(--primary) transition-colors">
                        <span className="material-symbols-outlined text-[28px]">group</span>
                        <div className="absolute left-14 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Groups</div>
                    </div>
                    <div className="group relative cursor-pointer text-slate-500 hover:text-(--primary) transition-colors">
                        <span className="material-symbols-outlined text-[28px]">call</span>
                        <div className="absolute left-14 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Calls</div>
                    </div>
                    <div className="group relative cursor-pointer text-slate-500 hover:text-(--primary) transition-colors">
                        <span className="material-symbols-outlined text-[28px]">bookmark</span>
                        <div className="absolute left-14 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Bookmarks</div>
                    </div>
                </nav>
            </div>
            <div className="flex flex-col items-center gap-6 w-full">
                <div className="group relative cursor-pointer text-slate-500 hover:text-(--primary) transition-colors">
                    <span className="material-symbols-outlined text-[28px]">settings</span>
                </div>
                <div className="size-10 rounded-full border-2 border-(--primary)/50 overflow-hidden cursor-pointer">
                    <img alt="User Profile" className="w-full h-full object-cover" src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuCtL_U612nlfE8sJNWQSctdn7exIM6mBAVuVePZkvkH-RD6qbWded7_qmOZrBPgC7pQgOCHFisLmrOFQ7zqa5xDJjFa7n3qO5bPMfW1T_fm3mumK1TKb76SAWy_SM8InrWyc4_9XoF0y_MqxEQheJ5VY4kNp-p4gfN8Mbo6OI-vqUle64g-ROB38nRppuomIOAghwb1WFOYFtXR-jtoGEaIyOl6WkqG716qey_bX7_XkUOnWYvuCPWnxi1L0V_3xyqjzbMe5ApOtg"} />
                </div>
            </div>
        </aside>
    );
}