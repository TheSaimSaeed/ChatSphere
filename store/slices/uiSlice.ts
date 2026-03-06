import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export interface UiState {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    toasts: Toast[];
}

const initialState: UiState = {
    theme: 'light',
    soundEnabled: true,
    notificationsEnabled: false,
    toasts: [],
};

/** Manages global UI preferences, theming, and the toast notification system. */
export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        addToast: (state, action: PayloadAction<Toast>) => {
            if (state.toasts.length >= 3) {
                state.toasts.shift();
            }
            state.toasts.push(action.payload);
        },
        removeToast: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },
    },
});

export const { setTheme, addToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;
