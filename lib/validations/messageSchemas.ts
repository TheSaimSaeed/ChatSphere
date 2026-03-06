import { z } from 'zod';

export const sendMessageSchema = z.object({
    chatId: z.string().min(1, 'Chat ID is required'),
    type: z.enum(['text', 'image', 'video', 'file']).default('text'),
    content: z.string().max(4000).optional(),
    mediaId: z.string().optional(),
}).refine(data => data.type === 'text' ? !!data.content : !!data.mediaId, {
    message: "Text messages require content; media messages require mediaId",
    path: ['content']
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
