import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

/** Exposes the global Redux store containing auth, chat, and UI states. */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        ui: uiReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
