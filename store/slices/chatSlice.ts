import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchChatsThunk, createDMThunk } from './chatThunks';

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
    },
});

export const { setChats, setActiveChatId } = chatSlice.actions;
export default chatSlice.reducer;
