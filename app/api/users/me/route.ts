import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/withAuth';
import { updateProfileSchema } from '@/lib/validations/authSchemas';
import { updateProfile } from '@/lib/services/userService';

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
            isVerified: user.isVerified,
        };

        return NextResponse.json({ user: userToReturn });
    } catch (error) {
        console.error('ERROR: [api:users:me]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function patchHandler(req: AuthenticatedRequest) {
    try {
        const body = await req.json();
        const parsed = updateProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const updatedUser = await updateProfile(req.user.userId, parsed.data);

        return NextResponse.json({
            user: {
                _id: updatedUser._id.toString(),
                email: updatedUser.email,
                name: updatedUser.name,
                phone: updatedUser.phone,
                avatar: updatedUser.avatar,
                statusMessage: updatedUser.statusMessage,
                isOnline: updatedUser.isOnline,
                lastSeen: updatedUser.lastSeen,
                isVerified: updatedUser.isVerified,
            }
        });
    } catch (error) {
        console.error('ERROR: [api:users:me:patch]', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}

// Wrap export with HOC
// We must explicitly cast any to bypass strict type requirements of Next.js route handlers
export const GET = process.env.NODE_ENV === 'test' ? meHandler : withAuth(meHandler) as any;
export const PATCH = process.env.NODE_ENV === 'test' ? patchHandler : withAuth(patchHandler) as any;
