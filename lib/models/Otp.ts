import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
    userId: mongoose.Types.ObjectId;
    code: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        code: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        used: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// TTL index to automatically delete expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ userId: 1, code: 1 });

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', OtpSchema);

export default Otp;
