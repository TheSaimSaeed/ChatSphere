import { Avatar } from '@/components/shared/Avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, CheckCheck, BellOff } from 'lucide-react';
import { Chat } from '@/store/slices/chatSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ChatListItemProps {
    chat: Chat;
    isActive: boolean;
    onClick: () => void;
}

export default function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
    const { user } = useSelector((state: RootState) => state.auth);

    // Identify the other participant for DMs
    const otherParticipant = chat.isGroup
        ? null
        : chat.participants.find(p => String(p._id) !== String(user?._id)) || chat.participants[0];

    const name = chat.isGroup ? chat.name : otherParticipant?.name;
    const avatar = chat.isGroup ? chat.icon : otherParticipant?.avatar;
    const isOnline = chat.isGroup ? false : otherParticipant?.isOnline;

    // Formatting timestamp
    let timeLabel = '';
    if (chat.updatedAt) {
        const date = new Date(chat.updatedAt);
        if (isToday(date)) {
            timeLabel = format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            timeLabel = 'Yesterday';
        } else {
            timeLabel = format(date, 'dd/MM/yyyy');
        }
    }

    // Last message preview
    const lastMsg = chat.lastMessage;
    const isMyLastMsg = lastMsg?.senderId === user?._id;
    let previewText = '';
    if (lastMsg) {
        if (lastMsg.media) {
            previewText = `[Media]`; // Simplified for now
        } else {
            previewText = lastMsg.content || '';
        }
        if (isMyLastMsg) {
            previewText = `You: ${previewText}`;
        }
    }

    // Placeholder unread count (always 0 in Slice 3)
    const unreadCount = 0;

    return (
        <div
            onClick={onClick}
            className={`flex items-center h-18 px-4 py-2 cursor-pointer transition-colors border-b border-white/5 border-l-[3px] ${
                isActive
                    ? 'border-l-primary bg-white/6'
                    : 'border-l-transparent hover:bg-white/4'
            }`}
        >
            <div className="shrink-0">
                <Avatar name={name || 'Unknown'} src={avatar} isOnline={isOnline} className="w-12 h-12" />
            </div>

            <div className="flex flex-col flex-1 pl-3 min-w-0 justify-center">
                <div className="flex justify-between items-center mb-0.5">
                    <span className={`text-base font-semibold truncate ${unreadCount > 0 ? 'text-slate-100 font-bold' : 'text-slate-100'}`}>
                        {name}
                    </span>
                    <span className={`text-xs ${unreadCount > 0 ? 'text-primary font-bold' : 'text-slate-500'}`}>
                        {timeLabel}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center text-slate-500 text-sm truncate">
                        {isMyLastMsg && lastMsg && (
                            <span className="mr-1 inline-flex items-center">
                                {/* Placeholder for message state ticks. 
                                    In proper state logic, we'd check if readBy array has other user */}
                                <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                            </span>
                        )}
                        <span className="truncate">{previewText || "No messages yet"}</span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                        {/* Placeholder for muted icon */}
                        {/* <BellOff className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" /> */}
                        {unreadCount > 0 && (
                            <div className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-black text-[10px] font-bold">
                                {unreadCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
