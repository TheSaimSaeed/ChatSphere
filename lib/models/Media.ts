import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMedia extends Document {
    uploadedBy: Types.ObjectId;
    url: string;
    publicId: string;
    resourceType: 'image' | 'video' | 'raw';
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: Date;
    updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
    {
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        resourceType: { type: String, enum: ["image", "video", "raw"], required: true },
        originalName: { type: String, default: "file" },
        mimeType: { type: String, required: true },
        sizeBytes: { type: Number, required: true },
    },
    { timestamps: true }
);

MediaSchema.index({ uploadedBy: 1 });
MediaSchema.index({ createdAt: -1 });

const Media: Model<IMedia> = mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);

export default Media;
