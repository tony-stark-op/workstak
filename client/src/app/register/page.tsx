'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerUser } from '@/lib/api';
import { Mail, User, Building, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [organization, setOrganization] = useState('Cloudbyadi'); // Default
    const [emailPrefix, setEmailPrefix] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const email = `${emailPrefix}@${organization.toLowerCase()}.com`;
            const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

            await registerUser({
                firstName,
                lastName,
                organization,
                email,
                username
            });

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F5F6FA]">
            {/* Background Ambience */}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-card w-full max-w-lg p-10 bg-white relative z-10"
            >
                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                                <CheckCircle className="text-green-600" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Welcome, {firstName}!</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Your account has been created successfully.<br />
                                Credentials sent to <span className="font-bold text-gray-900">{emailPrefix}@{organization.toLowerCase()}.com</span>
                            </p>
                            <Link
                                href="/login"
                                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 flex justify-center items-center gap-2 font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                            >
                                Proceed to Login <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="text-center mb-10">
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                                    <User size={24} />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    Join WorkStack
                                </h1>
                                <p className="text-gray-500 mt-2 text-sm">Create your enterprise account in seconds.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-8 flex items-center justify-center border border-red-100 font-medium">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">First Name</label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                required
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Last Name</label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                required
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Organization</label>
                                    <div className="relative group">
                                        <Building size={16} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                                        <select
                                            value={organization}
                                            onChange={(e) => setOrganization(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 appearance-none cursor-pointer"
                                        >
                                            <option value="Cloudbyadi">Cloudbyadi</option>
                                            <option value="WorkStack">WorkStack</option>
                                            <option value="DevCorp">DevCorp</option>
                                        </select>
                                        <div className="absolute right-4 top-4 pointer-events-none">
                                            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-400"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Work Email</label>
                                    <div className="flex rounded-xl shadow-sm">
                                        <div className="relative flex-grow group z-10">
                                            <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                required
                                                value={emailPrefix}
                                                onChange={(e) => setEmailPrefix(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-l-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400 border-r-0"
                                                placeholder="john.doe"
                                            />
                                        </div>
                                        <span className="inline-flex items-center px-4 rounded-r-xl border border-l-0 border-gray-200 bg-gray-100 text-gray-500 text-sm font-medium">
                                            @{organization.toLowerCase()}.com
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 mt-2 block"
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </form>

                            <p className="text-center mt-8 text-sm text-gray-500">
                                Already have an account?{' '}
                                <Link href="/login" className="text-indigo-600 font-bold hover:underline hover:text-indigo-800 transition-colors">
                                    Log In
                                </Link>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
