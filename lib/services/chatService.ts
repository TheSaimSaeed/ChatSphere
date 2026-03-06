import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';

/** Retrieves all chats for a given user, populated and sorted by recent activity. */
export async function getChats(userId: string) {
    await connectDB();

    const chats = await Chat.find({ participants: userId })
        .populate({
            path: 'participants',
            select: '_id name email avatar isOnline lastSeen',
            model: User
        })
        .sort({ updatedAt: -1 })
        .lean();

    return chats;
}

/** Creates or retrieves an existing 1-to-1 conversation (DM) between two users. */
export async function createDM(userId: string, recipientId: string) {
    await connectDB();

    if (userId === recipientId) {
        const error: any = new Error("Cannot create a DM with yourself");
        error.statusCode = 400;
        throw error;
    }

    const recipientExists = await User.findById(recipientId).lean();
    if (!recipientExists) {
        const error: any = new Error("Recipient not found");
        error.statusCode = 404;
        throw error;
    }

    // Check if DM already exists
    let chat = await Chat.findOne({
        isGroup: false,
        participants: { $all: [userId, recipientId], $size: 2 }
    }).populate({
        path: 'participants',
        select: '_id name email avatar isOnline lastSeen',
        model: User
    });

    if (!chat) {
        // Create new DM
        chat = await Chat.create({
            isGroup: false,
            participants: [userId, recipientId]
        });

        // Populate to match return structure
        chat = await Chat.findById(chat._id)
            .populate({
                path: 'participants',
                select: '_id name email avatar isOnline lastSeen',
                model: User
            });
    }

    return chat;
}
