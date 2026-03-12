import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string | null;
    phone?: string;
    statusMessage: string;
    isVerified: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // we assume loading until initial session check
};

/** Holds the global state for the currently logged-in user and their session. */
export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        logoutUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
        setAuthLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setUser, updateUser, logoutUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
