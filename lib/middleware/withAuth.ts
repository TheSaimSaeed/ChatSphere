import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken } from '../jwt';
import { auth0 } from '../auth0';
import { connectDB } from '../db';
import User from '../models/User';

export interface AuthenticatedRequest extends NextRequest {
    user: {
        userId: string;
        email: string;
    };
}

type TokenPayload = {
    userId: string;
    email: string;
}

type AsyncRouteHandler = (req: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>;
type NextRouteHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

/** 
 * Bridge utility: Generates our legacy session token for Auth0 users and sets it on the response.
 * This makes them compatible with we legacy Socket.io and existing API logic.
 */
async function bridgeToLegacyAuth(auth0User: any, response: NextResponse) {
    const user = await User.findOne({ email: auth0User.email });
    if (!user) {
        // First sync check happened here if layout sync was skipped
        const { ensureUserSynced } = await import('../auth-sync');
        await ensureUserSynced({ user: auth0User });
    }

    if (user) {
        const legacyToken = signToken({
            userId: user._id.toString(),
            email: user.email,
        });

        response.cookies.set('session.token', legacyToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
    }
}

/**
 * Higher-order function to protect Next.js App Router API routes.
 * Supports both custom JWT token and Auth0 Session.
 */
export function withAuth(handler: AsyncRouteHandler): NextRouteHandler {
    return async (request: NextRequest, ...args: any[]) => {
        try {
            const cookies = request.cookies;
            const customToken = cookies.get('session.token')?.value;

            // 🪪 Try Trusted Headers (Injected by Middleware)
            const headerEmail = request.headers.get('x-auth-user-email');
            
            if (headerEmail || customToken) {
                await connectDB();
                
                // Determine user identify from either header or token
                let query = customToken 
                    ? { _id: (verifyToken(customToken) as TokenPayload).userId }
                    : { email: headerEmail };

                let user = await User.findOne(query);

                // 🔄 Sync on-the-fly if missing (Auth0 session exist but not in DB)
                if (!user && headerEmail) {
                    const session = await auth0.getSession();
                    if (session) {
                        const { ensureUserSynced } = await import('../auth-sync');
                        await ensureUserSynced(session);
                        user = await User.findOne({ email: headerEmail });
                    }
                }

                if (user) {
                    (request as AuthenticatedRequest).user = {
                        userId: user._id.toString(),
                        email: user.email,
                    };

                    const response = await handler(request as AuthenticatedRequest, ...args);

                    // 🎫 Apply Bridge: Set legacy cookie if missing
                    if (!customToken && headerEmail) {
                        const session = await auth0.getSession();
                        if (session) await bridgeToLegacyAuth(session.user, response);
                    }
                    return response;
                }
            }

            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        } catch (error) {
            console.error('ERROR: [withAuth]', error);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    };
}
