import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { loginSchema } from '@/lib/validations/authSchemas';
import { comparePassword } from '@/lib/services/authService';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/lib/env';

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

export async function POST(req: NextRequest) {
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

        const { email, password } = validatedData.data;

        // 3. Connect DB
        await connectDB();

        // 4. Find user and explicitly select the password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            // Generic error to prevent email enumeration
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 5. Compare Password
        const isMatch = await comparePassword(password, user.password!);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 6. Generate JWT
        const token = signToken({ userId: user._id.toString(), email: user.email });

        // 7. Sanitize output
        const userToReturn = {
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            statusMessage: user.statusMessage,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
        };

        // 8. Output Response
        const response = NextResponse.json(
            { message: 'Login successful', user: userToReturn },
            { status: 200 }
        );

        // 9. Set HTTP-only Cookie
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

    } catch (error) {
        console.error('ERROR: [auth:login]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
