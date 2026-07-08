import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { loginSchema } from '@/lib/validations/authSchemas';
import { loginUser } from '@/lib/services/authService';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';
import { withLogging } from '@/lib/api-wrapper';

// Upstash rate limiting (only initialized if vars are present, for seamless dev fallback)
let ratelimit: Ratelimit | null = null;
if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Allow 5 requests per 15 minutes per IP
    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
        prefix: '@upstash/ratelimit',
    });
}

function getIpAddress(request: NextRequest): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const ips = forwardedFor.split(',');
        return ips[0].trim();
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp) return realIp.trim();

    // Local development fallback
    return "127.0.0.1";
}

const loginHandler = async (req: NextRequest) => {
    try {
        // 1. Rate Limiting Check
        if (ratelimit) {
            const ip = getIpAddress(req);
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
            }
        }

        const body = await req.json();

        // 2. Validate Input
        const validatedData = loginSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Invalid credentials', details: validatedData.error.flatten() },
                { status: 400 }
            );
        }

        // 3. Delegate to service layer
        const userToReturn = await loginUser(validatedData.data);

        // 4. Generate JWT
        const token = signToken({ userId: userToReturn._id, email: userToReturn.email });

        // 5. Output Response
        const response = NextResponse.json(
            { message: 'Login successful', user: userToReturn },
            { status: 200 }
        );

        // 6. Set HTTP-only Cookie
        ; (await cookies()).set({
            name: 'session.token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('ERROR: [api:auth:login]', error);
        if (error.isUnverified) {
            return NextResponse.json(
                { error: error.message, isUnverified: true },
                { status: 403 }
            );
        }
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: error.statusCode || 500 }
        );
    }
};

export const POST = withLogging(loginHandler);
