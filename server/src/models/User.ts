import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    organization: string;
    email: string;
    passwordHash: string;
    mustChangePassword: boolean; // New Field
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: true }, // Defaults to true for new users
}, {
    timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
