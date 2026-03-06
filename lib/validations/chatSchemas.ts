import { z } from 'zod';

export const createDMSchema = z.object({
    recipientId: z.string().min(1, 'Recipient ID is required'),
});

export const createGroupSchema = z.object({
    name: z.string().min(1, 'Group name is required').trim(),
    participants: z.array(z.string()).min(2, 'At least 2 additional participants required'),
    icon: z.string().url().optional().or(z.literal('')),
});

export const groupActionSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
});

export type CreateDMInput = z.infer<typeof createDMSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type GroupActionInput = z.infer<typeof groupActionSchema>;
