import { NextResponse, NextRequest } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { getChats } from '@/lib/services/chatService';
import { withLogging } from '@/lib/api-wrapper';

const getChatsHandler = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const chats = await getChats(req.user.userId);
        return NextResponse.json({ chats }, { status: 200 });
    } catch (error) {
        console.error('ERROR: [api:chats]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});

export const GET = withLogging(getChatsHandler);
