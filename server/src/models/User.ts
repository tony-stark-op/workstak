import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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

// Pre-save hook to hash password
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    } catch (error: any) {
        throw error;
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
    return bcrypt.compare(candidate, this.passwordHash);
};

export default mongoose.model<IUser>('User', userSchema);
