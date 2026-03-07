import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { sendMessageSchema } from '@/lib/validations/messageSchemas';
import { sendMessage, getMessages } from '@/lib/services/messageService';

/** Handles sending a new message via REST fallback */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
    const userId = req.user.userId;
    try {
        const body = await req.json();
        const parsed = sendMessageSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const result = await sendMessage(userId, parsed.data);
        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('ERROR: [messages:send] failed', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong' },
            { status: error.statusCode || 500 }
        );
    }
});

/** Handles fetching messages with cursor pagination */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
    const userId = req.user.userId;
    try {
        const { searchParams } = new URL(req.url);
        const chatId = searchParams.get('chatId');
        const before = searchParams.get('before');

        if (!chatId) {
            return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
        }

        const result = await getMessages(userId, chatId, before || undefined);
        return NextResponse.json(result, { status: 200 });

    } catch (error: any) {
        console.error('ERROR: [messages:get] failed', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong' },
            { status: error.statusCode || 500 }
        );
    }
});
