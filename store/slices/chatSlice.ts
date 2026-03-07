import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchChatsThunk, createDMThunk, fetchMessagesThunk } from './chatThunks';

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
    type: 'text' | 'image' | 'video' | 'file';
    createdAt: string;
    status: any;
    media: any;
}

export interface ChatState {
    chats: Chat[];
    activeChatId: string | null;
    messagesByChatId: Record<string, Message[]>;
    typingByChatId: Record<string, string[]>;
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
        addMessage: (state, action: PayloadAction<Message>) => {
            const msg = action.payload;
            if (!state.messagesByChatId[msg.chatId]) {
                state.messagesByChatId[msg.chatId] = [];
            }
            // Add if not exists (prevent duplicates from socket + optimistic)
            const exists = state.messagesByChatId[msg.chatId].find(m => m._id === msg._id || (m as any).tempId === msg._id);
            if (!exists) {
                state.messagesByChatId[msg.chatId].push(msg);
            }
        },
        setMessages: (state, action: PayloadAction<{ chatId: string, messages: Message[], append?: boolean }>) => {
            const { chatId, messages, append } = action.payload;
            if (append) {
                const current = state.messagesByChatId[chatId] || [];
                // append at start for older messages
                state.messagesByChatId[chatId] = [...messages, ...current];
            } else {
                state.messagesByChatId[chatId] = messages;
            }
        },
        updateMessageStatus: (state, action: PayloadAction<{ chatId: string, messageId: string, status: any }>) => {
            const { chatId, messageId, status } = action.payload;
            const msgs = state.messagesByChatId[chatId];
            if (msgs) {
                const msg = msgs.find(m => m._id === messageId);
                if (msg) msg.status = status;
            }
        },
        updateChatLastMessage: (state, action: PayloadAction<{ chatId: string, lastMessage: any }>) => {
            const chat = state.chats.find(c => c._id === action.payload.chatId);
            if (chat) {
                chat.lastMessage = action.payload.lastMessage;
                chat.updatedAt = new Date().toISOString();
                // sort chats
                state.chats.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            }
        }
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
    },
});

export const { setChats, setActiveChatId, addMessage, setMessages, updateMessageStatus, updateChatLastMessage } = chatSlice.actions;
export default chatSlice.reducer;
