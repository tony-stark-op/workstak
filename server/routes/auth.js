const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();
const { z } = require('zod');
const auth = require('../middleware/auth');

// Email Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Validation Schemas
const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const changePasswordSchema = z.object({
    newPassword: z.string().min(6)
});

// Helper to generate random password
const generatePassword = (length = 8) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email } = registerSchema.parse(req.body);

        // Domain Check
        const allowedDomain = process.env.ALLOWED_DOMAIN;
        if (allowedDomain && !email.endsWith(`@${allowedDomain}`)) {
            return res.status(403).json({ message: `Access restricted to ${allowedDomain} emails only.` });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Generate Random Password
        const password = generatePassword();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            isFirstLogin: true
        });
        await user.save();

        // Send Email
        await transporter.sendMail({
            from: `"WorkStak Admin" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your WorkStak Access Credentials",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #6d28d9; text-align: center;">Welcome to WorkStak</h2>
                    <p>Hello ${name},</p>
                    <p>your account has been created. Please use the following temporary credentials to log in. You will be asked to change your password immediately.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                        <p style="margin: 5px 0; font-size: 14px; color: #555;">Email</p>
                        <p style="margin: 0; font-weight: bold; font-size: 16px;">${email}</p>
                        <br/>
                        <p style="margin: 5px 0; font-size: 14px; color: #555;">Temporary Password</p>
                        <p style="margin: 0; font-weight: bold; font-size: 18px; color: #d946ef; letter-spacing: 1px;">${password}</p>
                    </div>

                    <p>Click below to login:</p>
                    <p style="text-align: center;">
                        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to WorkStak</a>
                    </p>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">If you did not request this, please ignore this email.</p>
                </div>
            `,
        });

        console.log(`📧 Email sent to ${email}`);

        res.status(201).json({ message: 'Account created. Credentials have been sent to your email.' });
    } catch (error) {
        console.error('Registration/Email Error:', error);
        res.status(500).json({ message: 'Failed to send email. Account created but credentials not delivered.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        if (user.isFirstLogin) {
            return res.json({
                requirePasswordChange: true,
                token,
                message: 'Please change your password to continue.'
            });
        }

        res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Change Password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { newPassword } = changePasswordSchema.parse(req.body);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(req.user._id, {
            password: hashedPassword,
            isFirstLogin: false
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get All Users (for assignment)
router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({}, 'name email role');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
