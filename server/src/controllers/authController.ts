import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; // Imported!
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

// Configure Email Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // Make sure these are in your .env file
        pass: process.env.SMTP_PASS
    }
});

// 1. REGISTER (Enterprise Flow)
export const register = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, organization, email } = req.body;

        // Email is already constructed by the frontend: `${emailPrefix}@${org.com}`
        // const orgDomain = organization.toLowerCase() + '.com';
        // const email = `${emailPrefix}@${orgDomain}`;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists. Check email for credentials.' });
        }

        // Generate Random Password (8 chars)
        const generatedPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(generatedPassword, salt);

        // Create User
        const newUser = new User({
            firstName,
            lastName,
            organization,
            email,
            passwordHash,
            mustChangePassword: true // Enforce password change
        });

        await newUser.save();

        // SEND EMAIL (Real Implementation)
        console.log(`[Email Debug] Attempting to send email to: ${email}`);
        try {
            const info = await transporter.sendMail({
                from: `"WorkStack Admin" <${process.env.SMTP_USER}>`,
                to: email, // Sends to the constructed email
                // to: "YOUR_TEST_EMAIL@gmail.com", // Uncomment this line to test with your own email first!
                subject: "Welcome to WorkStack - Access Credentials",
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2>Welcome to ${organization}, ${firstName}!</h2>
                        <p>Your account has been provisioned.</p>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Login Email:</strong> ${email}</p>
                            <p><strong>Temporary Password:</strong> <code style="font-size: 1.2em; color: #d63384;">${generatedPassword}</code></p>
                        </div>
                        <p>Please login and set a new secure password immediately.</p>
                    </div>
                `
            });
            console.log(`[Email Debug] Email sent successfully! Message ID: ${info.messageId}`);
        } catch (emailError: any) {
            console.error("[Email Debug] FAILED to send email:", emailError.message);
            // Fallback: Log to console so user can still login
            console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.warn(`[FALLBACK CREDENTIALS] User: ${email} | Pass: ${generatedPassword}`);
            console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        }

        res.status(201).json({ message: 'Registration successful. Credentials sent to email.' });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

// 2. LOGIN (With Password Change Check)
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log(`[AUTH FAIL] Missing credentials for ${email || 'unknown'}`);
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`[AUTH FAIL] User not found: ${email}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            console.log(`[AUTH FAIL] Invalid password for: ${email}`);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        console.log(`[AUTH SUCCESS] User logged in: ${email} (${user._id})`);

        // CHECK IF PASSWORD CHANGE IS REQUIRED
        if (user.mustChangePassword) {
            return res.status(200).json({
                requirePasswordChange: true,
                userId: user._id,
                message: "Please set a new password."
            });
        }

        // Standard Login
        const token = jwt.sign(
            { id: user._id, email: user.email, organization: user.organization },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                email: user.email,
                organization: user.organization
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// 2.5 UPDATE PROFILE (New)
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { userId, firstName, lastName, avatar } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                email: user.email,
                organization: user.organization
            }
        });
    } catch (error) {
        console.error("Update Profile Error", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
};

// 3. CHANGE PASSWORD (New Endpoint)
export const changePassword = async (req: Request, res: Response) => {
    try {
        const { userId, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update User
        user.passwordHash = passwordHash;
        user.mustChangePassword = false; // Mark as done
        await user.save();

        // Generate Token immediately so they don't have to login again
        const token = jwt.sign(
            { id: user._id, email: user.email, organization: user.organization },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, avatar: user.avatar, email: user.email },
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Change Password Error", error);
        res.status(500).json({ error: "Failed to update password" });
    }
};

// 4. GET ALL USERS (For Assignee Dropdown)
export const getUsers = async (req: Request, res: Response) => {
    try {
        // Only return necessary fields
        const users = await User.find({}, 'firstName lastName email username organization');
        res.json(users);
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
