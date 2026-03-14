import { createAsyncThunk } from '@reduxjs/toolkit';

/** Fetches the chat list for the logged-in user. */
export const fetchChatsThunk = createAsyncThunk(
    'chat/fetchChats',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch('/api/chats');
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.error);
            return data.chats;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch chats');
        }
    },
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
            if (!res.ok) return rejectWithValue(data.error);
            return data.chat;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create DM');
        }
    },
);

/** Fetches paginated messages for a chat. */
export const fetchMessagesThunk = createAsyncThunk(
    'chat/fetchMessages',
    async ({ chatId, before }: { chatId: string; before?: string }, { rejectWithValue }) => {
        try {
            const url = before
                ? `/api/messages?chatId=${chatId}&before=${before}`
                : `/api/messages?chatId=${chatId}`;
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.error);
            return { chatId, messages: data, append: !!before };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch messages');
        }
    },
);

/** Creates a new group chat and returns the populated chat object. */
export const createGroupThunk = createAsyncThunk(
    'chat/createGroup',
    async (
        payload: { name: string; participants: string[]; icon?: string },
        { rejectWithValue },
    ) => {
        try {
            const res = await fetch('/api/chats/group', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.error);
            return data.chat;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create group');
        }
    },
);

/** Adds a member to a group chat (admin only). Returns the updated chat. */
export const addMemberThunk = createAsyncThunk(
    'chat/addMember',
    async ({ chatId, userId }: { chatId: string; userId: string }, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/chats/${chatId}/participants/add`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.error);
            return data.chat;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to add member');
        }
    },
);

/** Removes a member from a group chat (admin only). Returns the updated chat. */
export const removeMemberThunk = createAsyncThunk(
    'chat/removeMember',
    async ({ chatId, userId }: { chatId: string; userId: string }, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/chats/${chatId}/participants/remove`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.error);
            return data.chat;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to remove member');
        }
    },
);

/** Leaves a group chat and removes it from the sidebar. */
export const leaveGroupThunk = createAsyncThunk(
    'chat/leaveGroup',
    async (chatId: string, { rejectWithValue }) => {
        try {
            const res = await fetch(`/api/chats/${chatId}/leave`, {
                method: 'PATCH',
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.error);
            return { chatId, deleted: data.deleted };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to leave group');
        }
    },
);
