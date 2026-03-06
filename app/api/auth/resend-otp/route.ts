import { NextRequest, NextResponse } from 'next/server';
import { resendOtpSchema } from '@/lib/validations/authSchemas';
import { resendOtp } from '@/lib/services/authService';
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
        limiter: Ratelimit.slidingWindow(3, '15 m'), // Only allow 3 resends per 15 minutes
        analytics: true,
        prefix: '@upstash/ratelimit:resendOtp',
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

/** Handles OTP resends for unverified accounts. */
export async function POST(req: NextRequest) {
    try {
        if (ratelimit) {
            const ip = getIpAddress(req);
            const { success } = await ratelimit.limit(ip);
            if (!success) {
                return NextResponse.json({ error: 'Too many resend attempts. Please try again later.' }, { status: 429 });
            }
        }

        const body = await req.json();
        const validatedData = resendOtpSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: 'Invalid email format', details: validatedData.error.flatten() },
                { status: 400 }
            );
        }

        const result = await resendOtp(validatedData.data);

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error('ERROR: [auth:resend-otp]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: error.statusCode || 500 }
        );
    }
}
