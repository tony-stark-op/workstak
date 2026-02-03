import mongoose, { Schema, Document } from 'mongoose';

export interface IPullRequest extends Document {
    title: string;
    description: string;
    sourceBranch: string;
    targetBranch: string;
    repository: string;
    status: 'active' | 'completed' | 'abandoned';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const pullRequestSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    sourceBranch: { type: String, required: true },
    targetBranch: { type: String, required: true },
    repository: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IPullRequest>('PullRequest', pullRequestSchema);
