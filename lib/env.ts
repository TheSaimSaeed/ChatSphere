import { z } from 'zod';

const envSchema = z.object({
    MONGODB_URI: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().optional().default('http://localhost:3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().default('noreply@chatsphere.com'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('ERROR: Invalid environment variables', parsedEnv.error.flatten());
    throw new Error('Invalid environment variables');
}

/** Exported strongly-typed environment variables. */
export const env = parsedEnv.data;
