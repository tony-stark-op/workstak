'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api'; // Ensure you use your axios instance

export default function LoginPage() {
    const [step, setStep] = useState<'login' | 'change-password'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });

            // Check if user needs to change password
            if (res.data.requirePasswordChange) {
                setUserId(res.data.userId);
                setStep('change-password');
                setLoading(false);
                return;
            }

            // Normal Login
            login(res.data.token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid credentials');
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/change-password', { userId, newPassword });
            login(res.data.token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {/* Glass Panel Container */}
            <div className="glass-panel w-full max-w-md p-8 relative overflow-hidden">
                {/* Decorative Blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>

                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {step === 'login' ? 'Sign In' : 'Set New Password'}
                </h1>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                {step === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="glass-input w-full"
                                placeholder="you@workstack.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="glass-input w-full"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg font-medium"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg mb-4">
                            For your security, please set a new password for your first login.
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="glass-input w-full"
                                placeholder="New secure password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg font-medium"
                        >
                            {loading ? 'Updating...' : 'Set Password & Login'}
                        </button>
                    </form>
                )}

                {step === 'login' && (
                    <div className="mt-6 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:underline font-medium">
                            Register Now!
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
