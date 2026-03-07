"use client";

import { ReactNode, useEffect } from "react";
import NarrowSidebar from "@/components/sidebar/NarrowSidebar";
import Sidebar from "@/components/sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { connectSocket, disconnectSocket, getSocketClient } from "@/lib/socket/client";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { addMessage, updateMessageStatus, updateChatLastMessage } from "@/store/slices/chatSlice";

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
            dispatch(updateMessageStatus({ chatId: message.chatId, messageId: message._id, status: message.status }));
        });

        return () => {
            socket.off(SOCKET_EVENTS.MESSAGE_RECEIVE);
            socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED);
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
