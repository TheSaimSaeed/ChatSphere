"use client";

import { ReactNode, useEffect } from "react";
import NarrowSidebar from "@/components/sidebar/NarrowSidebar";
import Sidebar from "@/components/sidebar/Sidebar";
import NewGroupModal from "@/components/modals/NewGroupModal";
import GroupInfoPanel from "@/components/modals/GroupInfoPanel";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { connectSocket, disconnectSocket, getSocketClient } from "@/lib/socket/client";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import {
    addMessage,
    updateMessageStatus,
    updateChatLastMessage,
    addTypingUser,
    removeTypingUser,
    markMessagesReadByServer,
    updateUserPresence,
    addChat,
    updateGroupParticipants,
    removeChat,
} from "@/store/slices/chatSlice";
import { usePathname } from "next/navigation";

/** Root layout for the authenticated chat shell — mounts the sidebar, socket listeners, and global modals. */
export default function ChatLayout({ children }: { children: ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const { activeChatId } = useSelector((state: RootState) => state.chat);
    const pathname = usePathname();

    const isProfilePage = pathname === "/profile";
    const isMobileDetailView = !!activeChatId || isProfilePage;

    useEffect(() => {
        connectSocket();
        const socket = getSocketClient();

        // ── Messaging ──────────────────────────────────────────────
        socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, (message) => {
            dispatch(addMessage(message));
            dispatch(
                updateChatLastMessage({
                    chatId: message.chatId,
                    lastMessage: {
                        content: message.content,
                        senderId: message.senderId,
                        sentAt: message.createdAt,
                    },
                }),
            );
        });

        socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, (message) => {
            dispatch(
                updateMessageStatus({
                    chatId: message.chatId,
                    messageId: message._id,
                    tempId: (message as any).tempId,
                    status: message.status,
                }),
            );
        });

        socket.on(SOCKET_EVENTS.MESSAGE_READ, (data) => {
            dispatch(markMessagesReadByServer({ chatId: data.chatId, readBy: data.readBy }));
        });

        // ── Typing ─────────────────────────────────────────────────
        socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
            dispatch(addTypingUser({ chatId: data.chatId, userId: data.userId, name: data.name }));
        });

        socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
            dispatch(removeTypingUser({ chatId: data.chatId, userId: data.userId }));
        });

        // ── Presence ───────────────────────────────────────────────
        socket.on(SOCKET_EVENTS.PRESENCE_ONLINE, (data) => {
            dispatch(updateUserPresence({ userId: data.userId, isOnline: true }));
        });

        socket.on(SOCKET_EVENTS.PRESENCE_OFFLINE, (data) => {
            dispatch(updateUserPresence({ userId: data.userId, isOnline: false, lastSeen: data.lastSeen }));
        });

        // ── Group events ───────────────────────────────────────────
        socket.on(SOCKET_EVENTS.CHAT_CREATED, (chat) => {
            dispatch(addChat(chat));
        });

        socket.on(SOCKET_EVENTS.GROUP_MEMBER_ADDED, (data: { chat: any }) => {
            if (data.chat) {
                dispatch(updateGroupParticipants({
                    chatId: data.chat._id,
                    participants: data.chat.participants,
                    admin: data.chat.admin,
                }));
            }
        });

        socket.on(SOCKET_EVENTS.GROUP_MEMBER_REMOVED, (data: { chat: any; removedUserId: string }) => {
            if (data.chat) {
                dispatch(updateGroupParticipants({
                    chatId: data.chat._id,
                    participants: data.chat.participants,
                    admin: data.chat.admin,
                }));
            }
        });

        socket.on(SOCKET_EVENTS.GROUP_MEMBER_LEFT, (data: { chatId: string; userId: string }) => {
            dispatch(removeChat(data.chatId));
        });

        socket.on(SOCKET_EVENTS.GROUP_SYSTEM_MESSAGE, (message) => {
            dispatch(addMessage({ ...message, type: "system" }));
        });

        // ── Network-change reconnect ───────────────────────────────
        const handleOffline = () => disconnectSocket();
        const handleOnline = () => connectSocket();
        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
            socket.off(SOCKET_EVENTS.MESSAGE_RECEIVE);
            socket.off(SOCKET_EVENTS.MESSAGE_DELIVERED);
            socket.off(SOCKET_EVENTS.MESSAGE_READ);
            socket.off(SOCKET_EVENTS.TYPING_START);
            socket.off(SOCKET_EVENTS.TYPING_STOP);
            socket.off(SOCKET_EVENTS.PRESENCE_ONLINE);
            socket.off(SOCKET_EVENTS.PRESENCE_OFFLINE);
            socket.off(SOCKET_EVENTS.CHAT_CREATED);
            socket.off(SOCKET_EVENTS.GROUP_MEMBER_ADDED);
            socket.off(SOCKET_EVENTS.GROUP_MEMBER_REMOVED);
            socket.off(SOCKET_EVENTS.GROUP_MEMBER_LEFT);
            socket.off(SOCKET_EVENTS.GROUP_SYSTEM_MESSAGE);
            disconnectSocket();
        };
    }, [dispatch]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-(--color-bg-base)">
            {/* NarrowSidebar — desktop only */}
            <div className="hidden md:flex flex-col h-full shrink-0">
                <NarrowSidebar />
            </div>

            {/*
              Chat Sidebar visibility rules:
              - /profile on DESKTOP  → hidden (md:hidden in the isProfilePage branch)
              - /profile on MOBILE   → shown but only bottom-nav matters
              - Active chat on MOBILE → hidden (full-screen chat view)
              - Default              → shown full-width on mobile, fixed width on desktop
            */}
            <div
                className={[
                    "flex-col h-full shrink-0 w-full md:w-80",
                    isProfilePage
                        ? "hidden md:hidden"
                        : isMobileDetailView
                          ? "hidden md:flex"
                          : "flex",
                ].join(" ")}
            >
                <Sidebar />
            </div>

            {/* Main content area — full screen on mobile for profile & active chat */}
            <div
                className={[
                    "flex-1 h-full min-w-0 bg-[#0D1117]",
                    isMobileDetailView ? "flex" : "hidden md:flex",
                ].join(" ")}
            >
                {children}
            </div>

            {/* Global modals & panels — mounted once at layout level */}
            <NewGroupModal />
            <GroupInfoPanel />
        </div>
    );
}
