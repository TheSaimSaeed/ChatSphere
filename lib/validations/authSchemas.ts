import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(1, 'Full name is required').trim(),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Invalid international phone number format').optional().or(z.literal('')),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
    name: z.string().min(1, 'Full name is required').trim().optional(),
    statusMessage: z.string().max(100, 'Status must be less than 100 characters').optional(),
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Invalid phone format').optional().or(z.literal('')),
    avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const verifyEmailSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d{6}$/, 'Code must contain only numbers'),
});

export const resendOtpSchema = z.object({
    email: z.string().email(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
