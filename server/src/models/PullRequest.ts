import mongoose, { Schema, Document } from 'mongoose';

export interface IPullRequest extends Document {
    title: string;
    description: string;
    sourceBranch: string;
    targetBranch: string;
    repository: string;
    status: 'active' | 'merged' | 'abandoned';
    createdBy: mongoose.Types.ObjectId;
    reviewers: mongoose.Types.ObjectId[];
    tasks: mongoose.Types.ObjectId[];
    comments: Array<{
        user: mongoose.Types.ObjectId;
        text: string;
        date: Date;
    }>;
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
        enum: ['active', 'merged', 'abandoned'],
        default: 'active'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }], // Linked Tasks
    comments: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Virtual field for author (alias of createdBy)
pullRequestSchema.virtual('author').get(function () {
    return this.createdBy;
});

// Ensure virtuals are included in JSON
pullRequestSchema.set('toJSON', { virtuals: true });
pullRequestSchema.set('toObject', { virtuals: true });

export default mongoose.model<IPullRequest>('PullRequest', pullRequestSchema);
