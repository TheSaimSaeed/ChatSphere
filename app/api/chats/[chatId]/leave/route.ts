import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { leaveGroup } from '@/lib/services/chatService';
import { emitMemberLeft } from '@/lib/socket/server';

/** Removes the authenticated user from a group chat, transferring admin if needed. */
export const PATCH = withAuth(
    async (req: AuthenticatedRequest, { params }: { params: Promise<{ chatId: string }> }) => {
        try {
            const { chatId } = await params;
            const result = await leaveGroup(chatId, req.user.userId);

            if (!result.deleted && result.remainingParticipants) {
                emitMemberLeft(chatId, req.user.userId, result.remainingParticipants);
            }

            return NextResponse.json({ deleted: result.deleted, chatId }, { status: 200 });
        } catch (error: any) {
            console.error('ERROR: [PATCH /api/chats/[chatId]/leave] failed', error);
            const status = error.statusCode || 500;
            return NextResponse.json(
                { error: error.message || 'Something went wrong' },
                { status },
            );
        }
    },
);
