import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailSchema } from '@/lib/validations/authSchemas';
import { verifyEmail } from '@/lib/services/authService';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

let ratelimit: Ratelimit | null = null;
if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
    });
    ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
        prefix: '@upstash/ratelimit:verifyEmail',
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
    return "127.0.0.1";
}

/** Handles email otp verification. */
export async function POST(req: NextRequest) {
    try {
        if (ratelimit) {
            const ip = getIpAddress(req);
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return NextResponse.json({ error: 'Too many verification attempts. Please try again later.' }, { status: 429 });
            }
        }

        const body = await req.json();
        const validatedData = verifyEmailSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Invalid verification code format', details: validatedData.error.flatten() },
                { status: 400 }
            );
        }

        const userToReturn = await verifyEmail(validatedData.data);
        const token = signToken({ userId: userToReturn._id, email: userToReturn.email });

        const response = NextResponse.json(
            { message: 'Email verified successfully', user: userToReturn },
            { status: 201 } // Match PRD instruction
        );

        ; (await cookies()).set({
            name: 'session.token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;
    } catch (error: any) {
        console.error('ERROR: [auth:verify-email]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: error.statusCode || 500 }
        );
    }
}
