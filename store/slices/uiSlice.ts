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
    isContactInfoOpen: boolean;
    isGroupInfoOpen: boolean;
    isNewGroupModalOpen: boolean;
}

const initialState: UiState = {
    theme: 'light',
    soundEnabled: true,
    notificationsEnabled: false,
    toasts: [],
    isContactInfoOpen: false,
    isGroupInfoOpen: false,
    isNewGroupModalOpen: false,
};

/** Manages global UI preferences, theming, toast notifications, and panel/modal open states. */
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
            state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
        },
        setContactInfoOpen: (state, action: PayloadAction<boolean>) => {
            state.isContactInfoOpen = action.payload;
        },
        setGroupInfoOpen: (state, action: PayloadAction<boolean>) => {
            state.isGroupInfoOpen = action.payload;
        },
        setNewGroupModalOpen: (state, action: PayloadAction<boolean>) => {
            state.isNewGroupModalOpen = action.payload;
        },
    },
});

export const {
    setTheme,
    addToast,
    removeToast,
    setContactInfoOpen,
    setGroupInfoOpen,
    setNewGroupModalOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
