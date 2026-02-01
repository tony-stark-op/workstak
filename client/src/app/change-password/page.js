'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import useAuthStore from '@/store/useAuthStore';
import { Lock } from 'lucide-react';

export default function ChangePasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { isAuthenticated, user, initialize } = useAuthStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (isMounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [isMounted, isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/change-password', { newPassword });
            router.push('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted || !isAuthenticated) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
                        <Lock className="text-purple-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Change Password</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Please set a new password for your account to continue.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-400 mb-1">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-zinc-500"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-400 mb-1">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-zinc-500"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Updating...' : 'Update Password & Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
