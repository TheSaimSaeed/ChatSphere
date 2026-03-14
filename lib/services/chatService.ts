import { Types } from 'mongoose';
import { connectDB } from '@/lib/db';
import Chat from '@/lib/models/Chat';
import User from '@/lib/models/User';

const PARTICIPANT_SELECT = '_id name email avatar isOnline lastSeen';

/** Retrieves all chats for a given user, populated and sorted by recent activity. */
export async function getChats(userId: string) {
    await connectDB();

    const chats = await Chat.find({ participants: userId })
        .populate({ path: 'participants', select: PARTICIPANT_SELECT, model: User })
        .sort({ updatedAt: -1 })
        .lean();

    return chats;
}

/** Creates or retrieves an existing 1-to-1 conversation (DM) between two users. */
export async function createDM(userId: string, recipientId: string) {
    await connectDB();

    if (userId === recipientId) {
        const error: any = new Error('Cannot create a DM with yourself');
        error.statusCode = 400;
        throw error;
    }

    const recipientExists = await User.findById(recipientId).lean();
    if (!recipientExists) {
        const error: any = new Error('Recipient not found');
        error.statusCode = 404;
        throw error;
    }

    let chat = await Chat.findOne({
        isGroup: false,
        participants: { $all: [userId, recipientId], $size: 2 },
    }).populate({ path: 'participants', select: PARTICIPANT_SELECT, model: User });

    if (!chat) {
        chat = await Chat.create({ isGroup: false, participants: [userId, recipientId] });
        chat = await Chat.findById(chat._id)
            .populate({ path: 'participants', select: PARTICIPANT_SELECT, model: User });
    }

    return chat;
}

/** Creates a new group chat with the requesting user as admin. */
export async function createGroup(
    adminId: string,
    name: string,
    participants: string[],
    icon?: string,
) {
    await connectDB();

    const allParticipants = [adminId, ...participants.filter((p) => p !== adminId)];

    const chat = await Chat.create({
        isGroup: true,
        name: name.trim(),
        icon: icon || null,
        admin: adminId,
        participants: allParticipants,
    });

    const populated = await Chat.findById(chat._id)
        .populate({ path: 'participants', select: PARTICIPANT_SELECT, model: User })
        .lean();

    console.log('LOG: [chatService] group created', { chatId: chat._id, admin: adminId });
    return populated;
}

/** Adds a user to a group chat. Caller must be the group admin. */
export async function addParticipant(chatId: string, adminId: string, userId: string) {
    await connectDB();

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
        const error: any = new Error('Group not found');
        error.statusCode = 404;
        throw error;
    }

    if (chat.admin?.toString() !== adminId) {
        const error: any = new Error('Only the group admin can add members');
        error.statusCode = 403;
        throw error;
    }

    const alreadyMember = chat.participants.some((p) => p.toString() === userId);
    if (alreadyMember) {
        const error: any = new Error('User is already a member of this group');
        error.statusCode = 409;
        throw error;
    }

    chat.participants.push(new Types.ObjectId(userId));
    await chat.save();

    const populated = await Chat.findById(chatId)
        .populate({ path: 'participants', select: PARTICIPANT_SELECT, model: User })
        .lean();

    console.log('LOG: [chatService] participant added', { chatId, userId });
    return populated;
}

/** Removes a user from a group chat. Caller must be the group admin. */
export async function removeParticipant(chatId: string, adminId: string, userId: string) {
    await connectDB();

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
        const error: any = new Error('Group not found');
        error.statusCode = 404;
        throw error;
    }

    if (chat.admin?.toString() !== adminId) {
        const error: any = new Error('Only the group admin can remove members');
        error.statusCode = 403;
        throw error;
    }

    if (userId === adminId) {
        const error: any = new Error('Admin cannot remove themselves — use leave instead');
        error.statusCode = 400;
        throw error;
    }

    chat.participants = chat.participants.filter((p) => p.toString() !== userId) as any;
    await chat.save();

    const populated = await Chat.findById(chatId)
        .populate({ path: 'participants', select: PARTICIPANT_SELECT, model: User })
        .lean();

    console.log('LOG: [chatService] participant removed', { chatId, userId });
    return populated;
}

/** Removes the requesting user from a group chat. Transfers admin if needed. Deletes chat if empty. */
export async function leaveGroup(chatId: string, userId: string) {
    await connectDB();

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
        const error: any = new Error('Group not found');
        error.statusCode = 404;
        throw error;
    }

    const isMember = chat.participants.some((p) => p.toString() === userId);
    if (!isMember) {
        const error: any = new Error('You are not a member of this group');
        error.statusCode = 403;
        throw error;
    }

    chat.participants = chat.participants.filter((p) => p.toString() !== userId) as any;

    if (chat.participants.length === 0) {
        await Chat.findByIdAndDelete(chatId);
        console.log('LOG: [chatService] empty group deleted after last member left', { chatId });
        return { deleted: true, chatId };
    }

    // Transfer admin if the leaver was the admin
    if (chat.admin?.toString() === userId) {
        chat.admin = chat.participants[0] as any;
        console.log('LOG: [chatService] admin transferred', { chatId, newAdmin: chat.admin });
    }

    await chat.save();

    console.log('LOG: [chatService] user left group', { chatId, userId });
    return { deleted: false, chatId, remainingParticipants: chat.participants };
}
