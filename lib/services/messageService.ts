import { connectDB } from '../db';
import Message from '../models/Message';
import Chat from '../models/Chat';
import mongoose from 'mongoose';
import { SendMessageInput } from '../validations/messageSchemas';

/** Saves a new message to the database and updates the chat's lastMessage */
export async function sendMessage(userId: string, data: SendMessageInput) {
    await connectDB();

    const chat = await Chat.findById(data.chatId);
    if (!chat) {
        throw { statusCode: 404, message: 'Chat not found' };
    }

    if (!chat.participants.some(p => p.toString() === userId)) {
        throw { statusCode: 403, message: 'Not a participant of this chat' };
    }

    const messageDetails = {
        chatId: data.chatId,
        senderId: userId,
        type: data.type,
        content: data.content || '',
        media: data.mediaId || null,
        status: {
            sent: true,
            deliveredTo: [],
            readBy: []
        }
    };

    let message = await Message.create(messageDetails);

    chat.lastMessage = {
        content: message.type === 'text' ? message.content : `[${message.type}]`,
        senderId: new mongoose.Types.ObjectId(userId),
        sentAt: (message as any).createdAt
    };
    // Force Mongoose to consider lastMessage modified if it's a subdocument issue.
    // Also we trigger updatedAt
    chat.markModified('lastMessage');
    await chat.save();

    message = await message.populate('senderId', 'name avatar');
    // if (message.media) {
    //     message = await message.populate('media');
    // }

    return message.toJSON();
}

/** Fetches paginated messages for a specific chat and reverses for client rendering */
export async function getMessages(userId: string, chatId: string, before?: string) {
    await connectDB();

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.some(p => p.toString() === userId)) {
        throw { statusCode: 403, message: 'Not authorized or chat not found' };
    }

    const query: any = { chatId };
    if (before) {
        query._id = { $lt: new mongoose.Types.ObjectId(before) };
    }

    const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(30)
        .populate('senderId', 'name avatar')
        // .populate('media') // Slice 4 doesn't have Media yet
        .lean();

    return messages.reverse();
}

/** Updates readBy array for all unread messages in a chat */
export async function markMessagesAsRead(userId: string, chatId: string) {
    await connectDB();
    await Message.updateMany(
        { chatId, senderId: { $ne: userId }, 'status.readBy': { $ne: userId } },
        { $addToSet: { 'status.readBy': userId } }
    );
}

/** Updates deliveredTo array for a message */
export async function markMessageAsDelivered(messageId: string, userIds: string[]) {
    await connectDB();
    const updated = await Message.findByIdAndUpdate(messageId, {
        $addToSet: { 'status.deliveredTo': { $each: userIds } }
    }, { new: true }).populate('senderId', 'name avatar').lean();
    return updated;
}
