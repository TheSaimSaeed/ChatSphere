import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IChat extends Document {
    isGroup: boolean;
    participants: Types.ObjectId[];
    name: string | null;
    icon: string | null;
    admin: Types.ObjectId | null;
    lastMessage: {
        content: string | null;
        senderId: Types.ObjectId | null;
        sentAt: Date | null;
    } | null;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
    {
        isGroup: { type: Boolean, default: false },
        participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
        name: { type: String, default: null, trim: true },
        icon: { type: String, default: null },
        admin: { type: Schema.Types.ObjectId, ref: "User", default: null },
        lastMessage: {
            content: { type: String, default: null },
            senderId: { type: Schema.Types.ObjectId, ref: "User", default: null },
            sentAt: { type: Date, default: null },
        },
    },
    { timestamps: true }
);

ChatSchema.index({ participants: 1 });
ChatSchema.index({ updatedAt: -1 });

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export default Chat;
