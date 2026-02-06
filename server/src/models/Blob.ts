import mongoose, { Schema, Document } from 'mongoose';

export interface IBlob extends Document {
    repoId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const BlobSchema: Schema = new Schema({
    repoId: { type: Schema.Types.ObjectId, ref: 'Repository', required: true },
    content: { type: String, required: false, default: '' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IBlob>('Blob', BlobSchema);
