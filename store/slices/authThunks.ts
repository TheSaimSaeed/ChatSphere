import { createAsyncThunk } from '@reduxjs/toolkit';
import { RegisterInput, LoginInput, VerifyEmailInput, ResendOtpInput } from '@/lib/validations/authSchemas';
import { User, setUser, logoutUser, setAuthLoading } from './authSlice';

// Base URL handling for client side
const API_URL = '/api';

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (credentials: RegisterInput, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.error || 'Registration failed');
            }

            // DO NOT dispatch setUser here; they are unverified.
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred during registration');
        }
    }
);

export const loginThunk = createAsyncThunk(
    'auth/login',
    async (credentials: LoginInput, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                // Return entire data to catch isUnverified flag
                return rejectWithValue(data);
            }

            dispatch(setUser(data.user));
            return data.user;
        } catch (error: any) {
            return rejectWithValue({ error: error.message || 'An error occurred during login' });
        }
    }
);

export const verifyEmailThunk = createAsyncThunk(
    'auth/verifyEmail',
    async (payload: VerifyEmailInput, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetch(`${API_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.error || 'Verification failed');
            }

            dispatch(setUser(data.user));
            return data.user;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred during verification');
        }
    }
);

export const resendOtpThunk = createAsyncThunk(
    'auth/resendOtp',
    async (payload: ResendOtpInput, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_URL}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.error || 'Failed to resend code');
            }

            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred while resending code');
        }
    }
);

export const logoutThunk = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
            });

            if (!response.ok) {
                return rejectWithValue('Logout failed');
            }

            dispatch(logoutUser());
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred during logout');
        }
    }
);

export const checkSessionThunk = createAsyncThunk(
    'auth/checkSession',
    async (_, { rejectWithValue, dispatch }) => {
        dispatch(setAuthLoading(true));
        try {
            const response = await fetch(`${API_URL}/users/me`);

            const data = await response.json();

            if (!response.ok || !data.user.isVerified) {
                dispatch(logoutUser());
                return rejectWithValue(data.error || 'Session invalid');
            }

            dispatch(setUser(data.user));
            return data.user;
        } catch (error: any) {
            dispatch(logoutUser());
            return rejectWithValue(error.message || 'An error occurred fetching session');
        }
    }
);
