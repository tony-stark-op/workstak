'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/api/axios';
import { Mail, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic client-side domain check for immediate feedback
        if (!email.endsWith('@cloudbyadi.com')) {
            setError('Access is restricted to @cloudbyadi.com emails only.');
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/auth/register', { name, email });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 text-center space-y-6">
                    <div className="flex justify-center text-green-500">
                        <CheckCircle size={64} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Access Requested!</h2>
                    <p className="text-zinc-400">
                        Your account credentials have been generated and sent to <strong>{email}</strong>.
                    </p>
                    <p className="text-zinc-500 text-sm">
                        Please check your inbox (and spam folder). You will be required to change your password upon first login.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Request Access
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">Join the CloudByAdi WorkStak</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-zinc-500"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white placeholder-zinc-500"
                                    placeholder="name@cloudbyadi.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Mail size={18} className="absolute right-4 top-3.5 text-zinc-500" />
                            </div>
                            <p className="mt-1 text-xs text-zinc-500 ml-1">
                                Must be a @cloudbyadi.com email.
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Request Access Credentials'}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-purple-400 hover:text-purple-300">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
