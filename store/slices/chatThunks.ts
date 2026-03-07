import { createAsyncThunk } from '@reduxjs/toolkit';

/** Fetches the chat list for the logged-in user. */
export const fetchChatsThunk = createAsyncThunk(
    'chat/fetchChats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch('/api/chats');
            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.error);
            }

            return data.chats;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch chats');
        }
    }
);

/** Creates a DM or fetches an existing one. */
export const createDMThunk = createAsyncThunk(
    'chat/createDM',
    async (recipientId: string, { rejectWithValue }) => {
        try {
            const res = await fetch('/api/chats/dm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId }),
            });
            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.error);
            }

            return data.chat;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create DM');
        }
    }
);

/** Fetches paginated messages for a chat */
export const fetchMessagesThunk = createAsyncThunk(
    'chat/fetchMessages',
    async ({ chatId, before }: { chatId: string, before?: string }, { rejectWithValue }) => {
        try {
            const url = before ? `/api/messages?chatId=${chatId}&before=${before}` : `/api/messages?chatId=${chatId}`;
            const res = await fetch(url);
            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.error);
            }

            return { chatId, messages: data, append: !!before };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch messages');
        }
    }
);
