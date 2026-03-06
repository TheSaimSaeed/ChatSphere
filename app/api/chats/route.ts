import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { getChats } from '@/lib/services/chatService';

/** Handles returning the list of chats for the authenticated user. */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const chats = await getChats(req.user.userId);
        return NextResponse.json({ chats }, { status: 200 });
    } catch (error) {
        console.error('ERROR: [api:chats]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});
