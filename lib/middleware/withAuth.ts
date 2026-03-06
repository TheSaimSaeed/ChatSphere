import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../jwt';

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

/**
 * Higher-order function to protect Next.js App Router API routes.
 * It verifies the JWT token from the `session.token` cookie and injects
 * the decoded user payload into the request object.
 */
export function withAuth(handler: AsyncRouteHandler): AsyncRouteHandler {
    return async (request: AuthenticatedRequest, ...args: any[]) => {
        try {
            const token = request.cookies.get('session.token')?.value;

            if (!token) {
                return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
            }

            const decoded = verifyToken(token) as TokenPayload;

            if (!decoded || !decoded.userId) {
                return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
            }

            // Inject the user payload into the request
            request.user = decoded;

            // Call the original handler
            return handler(request, ...args);
        } catch (error) {
            console.error('ERROR: [withAuth]', error);
            return NextResponse.json({ error: 'Unauthorized: Authentication failed' }, { status: 401 });
        }
    };
}
