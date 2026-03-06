import { createAsyncThunk } from '@reduxjs/toolkit';
import { RegisterInput, LoginInput } from '@/lib/validations/authSchemas';
import { User, setUser, logoutUser, setAuthLoading } from './authSlice';

// Base URL handling for client side
const API_URL = '/api';

export const registerThunk = createAsyncThunk(
    'auth/register',
    async (credentials: RegisterInput, { rejectWithValue, dispatch }) => {
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

            dispatch(setUser(data.user));
            return data.user;
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
                return rejectWithValue(data.error || 'Login failed');
            }

            dispatch(setUser(data.user));
            return data.user;
        } catch (error: any) {
            return rejectWithValue(error.message || 'An error occurred during login');
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

            if (!response.ok) {
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
