import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { searchUsers } from '@/lib/services/userService';

/** Handles searching for users by email or name. */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        if (!q || q.length < 2) {
            return NextResponse.json({ error: 'Search query must be at least 2 characters long' }, { status: 400 });
        }

        const users = await searchUsers(req.user.userId, q);
        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error('ERROR: [api:users:search]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});
