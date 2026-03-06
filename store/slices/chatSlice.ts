import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
        // We'll add more in Slice 3 and 4
    },
});

export const { setChats, setActiveChatId } = chatSlice.actions;
export default chatSlice.reducer;
