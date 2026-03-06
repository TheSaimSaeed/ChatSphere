import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMessage extends Document {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    type: 'text' | 'image' | 'video' | 'file';
    content: string;
    media: Types.ObjectId | null;
    status: {
        sent: boolean;
        deliveredTo: Types.ObjectId[];
        readBy: Types.ObjectId[];
    };
    replyTo: Types.ObjectId | null;
    deletedFor: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true, index: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: { type: String, enum: ["text", "image", "video", "file"], default: "text" },
        content: { type: String, default: "", maxlength: 4000 },
        media: { type: Schema.Types.ObjectId, ref: "Media", default: null },
        status: {
            sent: { type: Boolean, default: true },
            deliveredTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
            readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
        },
        replyTo: { type: Schema.Types.ObjectId, ref: "Message", default: null },
        deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
