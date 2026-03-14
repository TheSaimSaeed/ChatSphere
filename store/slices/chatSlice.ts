import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    fetchChatsThunk,
    createDMThunk,
    fetchMessagesThunk,
    createGroupThunk,
    addMemberThunk,
    removeMemberThunk,
    leaveGroupThunk,
} from './chatThunks';

export interface Chat {
    _id: string;
    isGroup: boolean;
    name: string | null;
    icon: string | null;
    participants: any[];
    admin: string | null;
    lastMessage: any | null;
    updatedAt: string;
}

export interface Message {
    _id: string;
    chatId: string;
    senderId: string | any;
    content: string;
    type: 'text' | 'image' | 'video' | 'file' | 'system';
    createdAt: string;
    status: any;
    media: any;
}

export interface ChatState {
    chats: Chat[];
    activeChatId: string | null;
    messagesByChatId: Record<string, Message[]>;
    typingByChatId: Record<string, { userId: string; name: string }[]>;
}

const initialState: ChatState = {
    chats: [],
    activeChatId: null,
    messagesByChatId: {},
    typingByChatId: {},
};

/** Manages global state including chat list, active chat history, and typing indicators. */
export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setChats: (state, action: PayloadAction<Chat[]>) => {
            state.chats = action.payload;
        },
        setActiveChatId: (state, action: PayloadAction<string | null>) => {
            state.activeChatId = action.payload;
        },
        /** Prepends a newly created chat to the list (used after group creation). */
        addChat: (state, action: PayloadAction<Chat>) => {
            const exists = state.chats.find((c) => c._id === action.payload._id);
            if (!exists) {
                state.chats.unshift(action.payload);
            }
        },
        /** Updates participants list and admin for a group after member add/remove. */
        updateGroupParticipants: (
            state,
            action: PayloadAction<{ chatId: string; participants: any[]; admin: string | null }>,
        ) => {
            const chat = state.chats.find((c) => c._id === action.payload.chatId);
            if (chat) {
                chat.participants = action.payload.participants;
                chat.admin = action.payload.admin;
            }
        },
        /** Removes a group from the sidebar list when the user leaves it. */
        removeChat: (state, action: PayloadAction<string>) => {
            state.chats = state.chats.filter((c) => c._id !== action.payload);
            if (state.activeChatId === action.payload) {
                state.activeChatId = null;
            }
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            const msg = action.payload;
            if (!state.messagesByChatId[msg.chatId]) {
                state.messagesByChatId[msg.chatId] = [];
            }
            const exists = state.messagesByChatId[msg.chatId].find(
                (m) => m._id === msg._id || (m as any).tempId === msg._id,
            );
            if (!exists) {
                state.messagesByChatId[msg.chatId].push(msg);
            }

            if (state.typingByChatId[msg.chatId] && msg.senderId) {
                const senderId =
                    typeof msg.senderId === 'object' ? (msg.senderId as any)._id : msg.senderId;
                state.typingByChatId[msg.chatId] = state.typingByChatId[msg.chatId].filter(
                    (u) => u.userId !== senderId?.toString(),
                );
            }
        },
        setMessages: (
            state,
            action: PayloadAction<{ chatId: string; messages: Message[]; append?: boolean }>,
        ) => {
            const { chatId, messages, append } = action.payload;
            if (append) {
                const current = state.messagesByChatId[chatId] || [];
                state.messagesByChatId[chatId] = [...messages, ...current];
            } else {
                state.messagesByChatId[chatId] = messages;
            }
        },
        updateMessageStatus: (
            state,
            action: PayloadAction<{
                chatId: string;
                messageId: string;
                status: any;
                tempId?: string;
            }>,
        ) => {
            const { chatId, messageId, status, tempId } = action.payload;
            const msgs = state.messagesByChatId[chatId];
            if (msgs) {
                const msg = msgs.find(
                    (m) => m._id === messageId || (tempId && m._id === tempId),
                );
                if (msg) {
                    msg.status = status;
                    if (tempId && msg._id === tempId) {
                        msg._id = messageId;
                    }
                }
            }
        },
        updateChatLastMessage: (
            state,
            action: PayloadAction<{ chatId: string; lastMessage: any }>,
        ) => {
            const chat = state.chats.find((c) => c._id === action.payload.chatId);
            if (chat) {
                chat.lastMessage = action.payload.lastMessage;
                chat.updatedAt = new Date().toISOString();
                state.chats.sort(
                    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
                );
            }
        },
        addTypingUser: (
            state,
            action: PayloadAction<{ chatId: string; userId: string; name: string }>,
        ) => {
            const { chatId, userId, name } = action.payload;
            if (!state.typingByChatId[chatId]) {
                state.typingByChatId[chatId] = [];
            }
            const exists = state.typingByChatId[chatId].find((u) => u.userId === userId);
            if (!exists) {
                state.typingByChatId[chatId].push({ userId, name });
            }
        },
        removeTypingUser: (
            state,
            action: PayloadAction<{ chatId: string; userId: string }>,
        ) => {
            const { chatId, userId } = action.payload;
            if (state.typingByChatId[chatId]) {
                state.typingByChatId[chatId] = state.typingByChatId[chatId].filter(
                    (u) => u.userId !== userId,
                );
            }
        },
        markMessagesReadByServer: (
            state,
            action: PayloadAction<{ chatId: string; readBy: string }>,
        ) => {
            const { chatId, readBy } = action.payload;
            const msgs = state.messagesByChatId[chatId];
            if (msgs) {
                msgs.forEach((m) => {
                    const senderId =
                        typeof m.senderId === 'object' ? (m.senderId as any)._id : m.senderId;
                    if (
                        senderId?.toString() !== readBy &&
                        m.status &&
                        !m.status.readBy?.includes(readBy)
                    ) {
                        m.status.readBy = m.status.readBy || [];
                        m.status.readBy.push(readBy);
                    }
                });
            }
        },
        updateUserPresence: (
            state,
            action: PayloadAction<{ userId: string; isOnline: boolean; lastSeen?: string }>,
        ) => {
            const { userId, isOnline, lastSeen } = action.payload;
            state.chats.forEach((chat) => {
                chat.participants.forEach((p) => {
                    if (p._id === userId) {
                        p.isOnline = isOnline;
                        if (lastSeen) {
                            p.lastSeen = lastSeen;
                        }
                    }
                });
            });
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchChatsThunk.fulfilled, (state, action) => {
            state.chats = action.payload;
        });
        builder.addCase(createDMThunk.fulfilled, (state, action) => {
            const existingChat = state.chats.find((chat: any) => chat._id === action.payload._id);
            if (!existingChat) {
                state.chats.unshift(action.payload);
            }
            state.activeChatId = action.payload._id;
        });
        builder.addCase(fetchMessagesThunk.fulfilled, (state, action) => {
            const { chatId, messages, append } = action.payload;
            if (append) {
                const current = state.messagesByChatId[chatId] || [];
                state.messagesByChatId[chatId] = [...messages, ...current];
            } else {
                state.messagesByChatId[chatId] = messages;
            }
        });
        builder.addCase(createGroupThunk.fulfilled, (state, action) => {
            const chat = action.payload;
            if (chat && !state.chats.find((c) => c._id === chat._id)) {
                state.chats.unshift(chat);
            }
            if (chat) state.activeChatId = chat._id;
        });
        builder.addCase(addMemberThunk.fulfilled, (state, action) => {
            const chat = action.payload;
            if (chat) {
                const existing = state.chats.find((c) => c._id === chat._id);
                if (existing) {
                    existing.participants = chat.participants;
                    existing.admin = chat.admin;
                }
            }
        });
        builder.addCase(removeMemberThunk.fulfilled, (state, action) => {
            const chat = action.payload;
            if (chat) {
                const existing = state.chats.find((c) => c._id === chat._id);
                if (existing) {
                    existing.participants = chat.participants;
                    existing.admin = chat.admin;
                }
            }
        });
        builder.addCase(leaveGroupThunk.fulfilled, (state, action) => {
            const { chatId } = action.payload;
            state.chats = state.chats.filter((c) => c._id !== chatId);
            if (state.activeChatId === chatId) {
                state.activeChatId = null;
            }
        });
    },
});

export const {
    setChats,
    setActiveChatId,
    addChat,
    updateGroupParticipants,
    removeChat,
    addMessage,
    setMessages,
    updateMessageStatus,
    updateChatLastMessage,
    addTypingUser,
    removeTypingUser,
    markMessagesReadByServer,
    updateUserPresence,
} = chatSlice.actions;

export default chatSlice.reducer;
