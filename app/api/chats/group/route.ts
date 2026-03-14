import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { createGroupSchema } from '@/lib/validations/chatSchemas';
import { createGroup } from '@/lib/services/chatService';
import { emitGroupCreated } from '@/lib/socket/server';

/** Creates a new group chat with the authenticated user as admin. */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
    try {
        const body = await req.json();
        const parsed = createGroupSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const { name, participants, icon } = parsed.data;
        const chat = await createGroup(req.user.userId, name, participants, icon);

        // Notify all members in real time
        emitGroupCreated(chat);

        return NextResponse.json({ chat }, { status: 201 });
    } catch (error: any) {
        console.error('ERROR: [POST /api/chats/group] failed', error);
        const status = error.statusCode || 500;
        return NextResponse.json(
            { error: error.message || 'Something went wrong' },
            { status },
        );
    }
});
