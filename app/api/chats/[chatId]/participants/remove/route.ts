import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { groupActionSchema } from '@/lib/validations/chatSchemas';
import { removeParticipant } from '@/lib/services/chatService';
import { emitMemberRemoved } from '@/lib/socket/server';

/** Removes a member from a group chat. Only the group admin may call this. */
export const PATCH = withAuth(
    async (req: AuthenticatedRequest, { params }: { params: Promise<{ chatId: string }> }) => {
        try {
            const { chatId } = await params;
            const body = await req.json();
            const parsed = groupActionSchema.safeParse(body);

            if (!parsed.success) {
                return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
            }

            const chat = await removeParticipant(chatId, req.user.userId, parsed.data.userId);
            emitMemberRemoved(chat, parsed.data.userId);
            return NextResponse.json({ chat }, { status: 200 });
        } catch (error: any) {
            console.error('ERROR: [PATCH /api/chats/[chatId]/participants/remove] failed', error);
            const status = error.statusCode || 500;
            return NextResponse.json(
                { error: error.message || 'Something went wrong' },
                { status },
            );
        }
    },
);
