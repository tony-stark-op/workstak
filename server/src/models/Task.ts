import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    project: string; // Repo Name or Project ID
    assignee: mongoose.Types.ObjectId; // User ID
    position: number; // For drag and drop ordering
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    project: { type: String, required: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    position: { type: Number, default: 0 },
}, {
    timestamps: true,
});

export default mongoose.model<ITask>('Task', TaskSchema);
