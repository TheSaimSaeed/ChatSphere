"use client";

import { Avatar } from '@/components/shared/Avatar';
import { IconButton } from '@/components/shared/IconButton';
import { Users, SquarePen, MoreVertical } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { logoutThunk } from '@/store/slices/authThunks';
import { setNewGroupModalOpen } from '@/store/slices/uiSlice';

interface SidebarHeaderProps {
    onNewDMClick: () => void;
}

/** Renders the top header area of the sidebar containing user avatar and action buttons. */
export default function SidebarHeader({ onNewDMClick }: SidebarHeaderProps) {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleProfileClick = () => {
        router.push('/profile');
    };

    const handleLogout = async () => {
        await dispatch(logoutThunk());
        router.push('/login');
    };

    return (
        <div className="flex items-center justify-between px-4 h-14 bg-(--color-header) shrink-0">
            <div className="flex items-center space-x-3">
                <button onClick={handleProfileClick} className="focus:outline-none rounded-full focus-visible:ring-2 focus-visible:ring-white">
                    <Avatar name={user?.name || "User"} src={user?.avatar} isOnline={true} className="w-8 h-8" />
                </button>
                <div className="text-white font-bold text-base hidden lg:block">ChatSphere</div>
            </div>

            <div className="flex items-center space-x-2">
                <IconButton onClick={() => dispatch(setNewGroupModalOpen(true))} title="New Group">
                    <Users className="w-5 h-5 text-white" strokeWidth={1.5} />
                </IconButton>
                <IconButton onClick={onNewDMClick} title="New Chat">
                    <SquarePen className="w-5 h-5 text-white" strokeWidth={1.5} />
                </IconButton>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <IconButton title="Menu">
                            <MoreVertical className="w-5 h-5 text-white" strokeWidth={1.5} />
                        </IconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-(--color-bg-surface) text-(--color-text-primary) border-(--color-border)">
                        <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="opacity-50">
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-(--color-border)" />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-500">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
