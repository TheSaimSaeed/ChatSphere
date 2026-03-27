import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';

/**
 * Ensures that an Auth0 user is synced to our MongoDB database.
 */
export async function ensureUserSynced(session: any) {
    if (!session || !session.user) return null;

    await connectDB();

    const { user } = session;

    // Check if they already exist in our DB
    let existingUser = await User.findOne({ email: user.email });

    if (!existingUser) {
        // If they don't exist, create a new record in MongoDB
        existingUser = await User.create({
            email: user.email,
            name: user.name || user.nickname || "ChatSphere User",
            avatar: user.picture || null,
            auth0Id: user.sub, // Auth0's unique ID for the user
            isVerified: true,  // Social/Auth0 logins are already verified
        });
        console.log(`[auth-sync] Created new user: ${user.email}`);
    } else if (!existingUser.auth0Id) {
        // Link Auth0 ID if they existed but didn't have one linked yet
        existingUser.auth0Id = user.sub;
        await existingUser.save();
        console.log(`[auth-sync] Linked Auth0 ID for user: ${user.email}`);
    }

    // Return the MongoDB User
    return existingUser._id.toString();
}
