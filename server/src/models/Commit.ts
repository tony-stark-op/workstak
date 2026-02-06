import mongoose, { Schema, Document } from 'mongoose';

export interface ICommit extends Document {
    repoId: mongoose.Types.ObjectId;
    message: string;
    author: {
        name: string;
        email: string;
    };
    timestamp: Date;
    parentId: mongoose.Types.ObjectId | null;
    tree: {
        path: string; // "src/index.ts"
        blobId: mongoose.Types.ObjectId;
        type: 'blob' | 'tree'; // simplified, usually just blob for file. Folders are implied by paths.
    }[];
}

const CommitSchema: Schema = new Schema({
    repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    message: { type: String, required: true },
    author: {
        name: { type: String, required: true },
        email: { type: String, required: true },
    },
    timestamp: { type: Date, default: Date.now },
    parentId: { type: Schema.Types.ObjectId, ref: 'Commit', default: null },
    tree: [{
        path: { type: String, required: true },
        blobId: { type: Schema.Types.ObjectId, ref: 'Blob', required: true },
        type: { type: String, enum: ['blob', 'tree'], default: 'blob' }
    }]
});

export default mongoose.model<ICommit>('Commit', CommitSchema);
