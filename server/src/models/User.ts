import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    organization: string;
    mustChangePassword: boolean;
    createdAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    organization: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IUser>('User', userSchema);
