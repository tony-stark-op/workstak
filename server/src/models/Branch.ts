import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
    repoId: mongoose.Types.ObjectId;
    name: string;
    headCommitId: mongoose.Types.ObjectId | null;
}

const BranchSchema: Schema = new Schema({
    repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    name: { type: String, required: true },
    headCommitId: { type: Schema.Types.ObjectId, ref: 'Commit', default: null }
});

// Ensure unique branch names per repo
BranchSchema.index({ repoId: 1, name: 1 }, { unique: true });

export default mongoose.model<IBranch>('Branch', BranchSchema);
