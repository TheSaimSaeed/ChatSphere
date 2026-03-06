import { z } from 'zod';

// We do not parse FormData directly with Zod easily, 
// usually we parse the extracted fields from formidable.
export const mediaUploadSchema = z.object({
    // Will be validated server-side after parsing
    originalName: z.string().optional(),
    mimeType: z.enum([
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm',
        'application/pdf'
    ]),
    sizeBytes: z.number().max(50 * 1024 * 1024, 'Max size exceeded'),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;
