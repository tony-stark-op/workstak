'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { loginUser, registerUser } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            let data;
            if (isLogin) {
                data = await loginUser({ email, password });
            } else {
                data = await registerUser({ username, email, password });
            }

            login(data.token, data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
                    WorkStack VCS
                </h1>

                <div className="flex bg-gray-100 rounded-md p-1 mb-6">
                    <button
                        className={`flex-1 py-1 text-sm font-medium rounded-sm transition-colors ${isLogin ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-1 text-sm font-medium rounded-sm transition-colors ${!isLogin ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black text-gray-900"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-black text-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
}
