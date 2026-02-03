import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

import emailService from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, firstName, lastName, organization } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already registered. Please check your credentials.' });
        }

        // Generate random password
        const password = Math.random().toString(36).slice(-8);
        // const password = 'TempPass123!';
        // console.log(`[DEBUG CREDENTIALS] User: ${username} | Pass: ${password}`); // Restore log for debugging

        // Send Email (Async, don't await strictly to speed up response, or await if critical)
        await emailService.sendCredentials(email, username, password);

        const user = new User({
            username,
            email,
            passwordHash: password, // Will be hashed by pre-save hook
            firstName,
            lastName,
            organization,
            mustChangePassword: true
        });

        await user.save();

        res.status(201).json({ message: 'Registration successful. Credentials sent to email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.mustChangePassword) {
            return res.json({
                requirePasswordChange: true,
                userId: user._id,
                message: 'Please set a new password.'
            });
        }

        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { userId, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update password (pre-save hook will hash it)
        user.passwordHash = newPassword;
        user.mustChangePassword = false;
        await user.save();

        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });

    } catch (error) {
        res.status(500).json({ error: 'Password change failed' });
    }
};
