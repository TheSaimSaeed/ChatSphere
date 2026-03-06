import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { createDM } from '@/lib/services/chatService';
import { createDMSchema } from '@/lib/validations/chatSchemas';

/** Handles creating or fetching a Direct Message thread. */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json();
        const parsed = createDMSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const chat = await createDM(req.user.userId, parsed.data.recipientId);
        return NextResponse.json({ chat }, { status: 200 });
    } catch (error: any) {
        console.error('ERROR: [api:chats:dm]', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: error.statusCode || 500 }
        );
    }
});
