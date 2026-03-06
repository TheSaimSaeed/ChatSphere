import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    phone: string | null;
    name: string;
    avatar: string | null;
    statusMessage: string;
    isOnline: boolean;
    lastSeen: Date;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        phone: { type: String, default: null, trim: true },
        name: { type: String, required: true, trim: true },
        avatar: { type: String, default: null },
        statusMessage: { type: String, default: "Hey there! I'm using ChatSphere", maxlength: 100 },
        isOnline: { type: Boolean, default: false },
        lastSeen: { type: Date, default: Date.now },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

UserSchema.index({ name: 'text' });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
