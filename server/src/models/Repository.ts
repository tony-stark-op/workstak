import mongoose, { Document, Schema } from 'mongoose';

export interface IRepository extends Document {
    name: string;
    description?: string;
    isPrivate: boolean;
    ownerId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RepositorySchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isPrivate: { type: Boolean, default: false },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<IRepository>('Repository', RepositorySchema);
