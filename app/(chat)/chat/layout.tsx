"use client";

import { ReactNode, useEffect } from "react";
import NarrowSidebar from "@/components/sidebar/NarrowSidebar";
import Sidebar from "@/components/sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { connectSocket, disconnectSocket, getSocketClient } from "@/lib/socket/client";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { addMessage, updateMessageStatus, updateChatLastMessage, addTypingUser, removeTypingUser, markMessagesReadByServer, updateUserPresence } from "@/store/slices/chatSlice";

export default function ChatLayout({ children }: { children: ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const { activeChatId } = useSelector((state: RootState) => state.chat);

    useEffect(() => {
        connectSocket();
        const socket = getSocketClient();

        socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, (message) => {
            dispatch(addMessage(message));
            dispatch(updateChatLastMessage({
                chatId: message.chatId,
                lastMessage: { content: message.content, senderId: message.senderId, sentAt: message.createdAt }
            }));
        });

        socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, (message) => {
            dispatch(updateMessageStatus({
                chatId: message.chatId,
                messageId: message._id,
                tempId: (message as any).tempId,
                status: message.status
            }));
        });

        socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
            dispatch(addTypingUser({ chatId: data.chatId, userId: data.userId, name: data.name }));
        });

        socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
            dispatch(removeTypingUser({ chatId: data.chatId, userId: data.userId }));
        });

        socket.on(SOCKET_EVENTS.MESSAGE_READ, (data) => {
            dispatch(markMessagesReadByServer({ chatId: data.chatId, readBy: data.readBy }));
        });

        socket.on(SOCKET_EVENTS.PRESENCE_ONLINE, (data) => {
            dispatch(updateUserPresence({ userId: data.userId, isOnline: true }));
        });

        socket.on(SOCKET_EVENTS.PRESENCE_OFFLINE, (data) => {
            dispatch(updateUserPresence({ userId: data.userId, isOnline: false, lastSeen: data.lastSeen }));
        });

        // Artificially restrict Socket.io connections when Chrome Network Tab is set to "Offline"
        // This solves Chrome DevTools bypassing localhost WebSockets
        const handleOffline = () => disconnectSocket();
        const handleOnline = () => connectSocket();
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            socket.off(SOCKET_EVENTS.MESSAGE_RECEIVE);
            socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED);
            socket.off(SOCKET_EVENTS.TYPING_START);
            socket.off(SOCKET_EVENTS.TYPING_STOP);
            socket.off(SOCKET_EVENTS.MESSAGE_READ);
            socket.off(SOCKET_EVENTS.PRESENCE_ONLINE);
            socket.off(SOCKET_EVENTS.PRESENCE_OFFLINE);
            disconnectSocket();
        };
    }, [dispatch]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-(--color-bg-base)">
            <div className="hidden md:flex flex-col h-full shrink-0">
                <NarrowSidebar />
            </div>
            <div className={`${activeChatId ? 'hidden md:flex' : 'flex'} flex-col h-full shrink-0 w-full md:w-80`}>
                <Sidebar />
            </div>
            <div className={`${activeChatId ? 'flex' : 'hidden md:flex'} flex-1 h-full min-w-0 bg-[#0D1117]`}>
                {children}
            </div>
        </div>
    );
}
