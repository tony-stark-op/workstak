'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

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

            if (res.data.requirePasswordChange) {
                setUserId(res.data.userId);
                setStep('change-password');
                setLoading(false);
                return;
            }

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F6FA]">
            {/* Main Card */}
            <div className="dashboard-card w-full max-w-md p-10 bg-white relative overflow-hidden">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        {step === 'login' ? 'Welcome Back' : 'Set New Password'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        {step === 'login' ? 'Sign in to access your workspace' : 'Please secure your account'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {error}
                    </div>
                )}

                {step === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">Email</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold text-sm tracking-wide active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl mb-4 border border-yellow-100 flex gap-3">
                            <ShieldCheck className="shrink-0 text-yellow-600" size={20} />
                            <span>For security, please set a new password for your first login.</span>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">New Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400"
                                    placeholder="New secure password"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3.5 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 font-bold text-sm tracking-wide active:scale-[0.98]"
                        >
                            {loading ? 'Updating...' : 'Set Password & Login'}
                        </button>
                    </form>
                )}

                {step === 'login' && (
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-colors">
                            Register Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
