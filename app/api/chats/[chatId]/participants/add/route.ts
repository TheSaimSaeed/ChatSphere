import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { groupActionSchema } from '@/lib/validations/chatSchemas';
import { addParticipant } from '@/lib/services/chatService';
import { emitMemberAdded } from '@/lib/socket/server';

/** Adds a new member to a group chat. Only the group admin may call this. */
export const PATCH = withAuth(
    async (req: AuthenticatedRequest, { params }: { params: Promise<{ chatId: string }> }) => {
        try {
            const { chatId } = await params;
            const body = await req.json();
            const parsed = groupActionSchema.safeParse(body);

            if (!parsed.success) {
                return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
            }

            const chat = await addParticipant(chatId, req.user.userId, parsed.data.userId);
            emitMemberAdded(chat);
            return NextResponse.json({ chat }, { status: 200 });
        } catch (error: any) {
            console.error('ERROR: [PATCH /api/chats/[chatId]/participants/add] failed', error);
            const status = error.statusCode || 500;
            return NextResponse.json(
                { error: error.message || 'Something went wrong' },
                { status },
            );
        }
    },
);
