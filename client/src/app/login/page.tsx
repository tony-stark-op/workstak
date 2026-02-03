'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { changePassword } from '@/lib/api';
import { Mail, Lock, Key, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    // Step 1: Credentials
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Step 2: Force Change
    const [isForceChange, setIsForceChange] = useState(false);
    const [tempUserId, setTempUserId] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // @ts-ignore - Login now returns a complex object sometimes
            const res = await login(email, password);

            if (res && res.requirePasswordChange) {
                setIsForceChange(true);
                setTempUserId(res.userId);
                setIsLoading(false);
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error(err);
            setError('Invalid email or password.');
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            // Verify with custom change password flow or just re-login in context?
            // We need a way to update the context token.
            // For now, let's call API directly, then redirect to dashboard (AuthContext might lag if not updated)
            // Ideally AuthContext should have a 'setToken' method or we manually update localStorage/reload.

            await changePassword({ userId: tempUserId, newPassword });

            // Re-login fully for context update (simplest way without refactoring Context much)
            await login(email, newPassword);
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to change password');
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-[#1e1e1e] to-gray-900 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[50%] h-[50%] bg-teal-600/10 blur-[100px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel w-full max-w-md p-8 relative z-10"
            >
                <AnimatePresence mode="wait">
                    {!isForceChange ? (
                        // STEP 1: LOGIN
                        <motion.div key="login" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                                    Welcome Back
                                </h1>
                                <p className="text-gray-500 mt-2">Enter your credentials to access WorkStack.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center justify-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Email</label>
                                    <div className="glass-input flex items-center gap-2">
                                        <Mail size={16} className="text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-transparent outline-none w-full"
                                            placeholder="john.doe@workstack.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Password</label>
                                    <div className="glass-input flex items-center gap-2">
                                        <Lock size={16} className="text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-transparent outline-none w-full"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 mt-4"
                                >
                                    {isLoading ? 'Signing In...' : 'Log In'}
                                </button>
                            </form>

                            <p className="text-center mt-6 text-sm text-gray-500">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-teal-600 font-bold hover:underline">
                                    Create an Account
                                </Link>
                            </p>
                        </motion.div>
                    ) : (
                        // STEP 2: FORCE CHANGE
                        <motion.div
                            key="force-change"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="text-center mb-8">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Key className="text-amber-600" size={24} />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Security Update
                                </h1>
                                <p className="text-gray-500 mt-2 text-sm">You must set a new password for your first login.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center justify-center gap-2">
                                    <AlertTriangle size={14} /> {error}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">New Password</label>
                                    <div className="glass-input flex items-center gap-2">
                                        <Lock size={16} className="text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-transparent outline-none w-full"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Confirm Password</label>
                                    <div className="glass-input flex items-center gap-2">
                                        <CheckCircle size={16} className="text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-transparent outline-none w-full"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 mt-4 flex justify-center items-center gap-2"
                                >
                                    {isLoading ? 'Updating...' : <>Update Password <ArrowRight size={16} /></>}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
