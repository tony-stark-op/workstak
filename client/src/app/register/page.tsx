'use client';

import { useState } from 'react';
import Link from 'next/link';
import { registerUser } from '@/lib/api';
import { Mail, User, Building, ArrowRight, CheckCircle } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-[#1e1e1e] to-gray-900 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-teal-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-blue-600/10 blur-[100px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel w-full max-w-md p-8 relative z-10"
            >
                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="text-green-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {firstName}!</h2>
                            <p className="text-gray-600 mb-8">
                                Your access credentials have been sent to <br />
                                <span className="font-bold text-gray-800">{emailPrefix}@{organization.toLowerCase()}.com</span>
                            </p>
                            <Link
                                href="/login"
                                className="glass-button w-full bg-teal-600 text-white hover:bg-teal-700 flex justify-center items-center gap-2 font-bold py-3"
                            >
                                Proceed to Login <ArrowRight size={18} />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                                    Join WorkStack
                                </h1>
                                <p className="text-gray-500 mt-2">Enterprise-grade collaboration platform.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center justify-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">First Name</label>
                                        <div className="glass-input flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <input
                                                required
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                className="bg-transparent outline-none w-full"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Last Name</label>
                                        <div className="glass-input flex items-center gap-2">
                                            <User size={16} className="text-gray-400" />
                                            <input
                                                required
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                className="bg-transparent outline-none w-full"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Organization</label>
                                    <div className="glass-input flex items-center gap-2">
                                        <Building size={16} className="text-gray-400" />
                                        <select
                                            value={organization}
                                            onChange={(e) => setOrganization(e.target.value)}
                                            className="bg-transparent outline-none w-full text-gray-700 appearance-none cursor-pointer"
                                        >
                                            <option value="Cloudbyadi">Cloudbyadi</option>
                                            <option value="WorkStack">WorkStack</option>
                                            <option value="DevCorp">DevCorp</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">Work Email</label>
                                    <div className="glass-input flex items-center">
                                        <Mail size={16} className="text-gray-400 mr-2" />
                                        <input
                                            required
                                            value={emailPrefix}
                                            onChange={(e) => setEmailPrefix(e.target.value)}
                                            className="bg-transparent outline-none flex-1 min-w-0"
                                            placeholder="john.doe"
                                        />
                                        <span className="text-gray-400 text-sm border-l border-gray-300 pl-2 ml-2">
                                            @{organization.toLowerCase()}.com
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 mt-4"
                                >
                                    {isLoading ? 'Creating Account...' : 'Register Now'}
                                </button>
                            </form>

                            <p className="text-center mt-6 text-sm text-gray-500">
                                Already have an account?{' '}
                                <Link href="/login" className="text-teal-600 font-bold hover:underline">
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
