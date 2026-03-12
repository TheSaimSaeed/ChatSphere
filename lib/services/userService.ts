import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

/** Searches for users by exact email or fuzzy name match. Excludes the requesting user. */
export async function searchUsers(userId: string, query: string) {
    if (!query || query.length < 2) {
        return [];
    }

    await connectDB();

    const users = await User.find({
        _id: { $ne: userId },
        $or: [
            { email: query.toLowerCase() },
            { $text: { $search: query } }
        ]
    }).select('_id name email avatar isOnline').lean();

    return users;
}

/** Updates the profile fields for the authenticated user. */
export async function updateProfile(userId: string, data: { name?: string, statusMessage?: string, phone?: string, avatar?: string }) {
    await connectDB();

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: data },
        { new: true, runValidators: true }
    ).select('-password').lean();

    if (!user) {
        throw new Error('User not found');
    }
    
    return user;
}
