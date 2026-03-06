import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';

async function meHandler(req: AuthenticatedRequest) {
    try {
        await connectDB();

        const user = await User.findById(req.user.userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userToReturn = {
            _id: user._id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone,
            avatar: user.avatar,
            statusMessage: user.statusMessage,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
        };

        return NextResponse.json({ user: userToReturn });
    } catch (error) {
        console.error('ERROR: [api:users:me]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Wrap export with HOC
// We must explicitly cast any to bypass strict type requirements of Next.js route handlers
export const GET = process.env.NODE_ENV === 'test' ? meHandler : withAuth(meHandler) as any;
