'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Save, Lock, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile, changePassword } from '@/lib/api';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
    const { user, login } = useAuth();

    // Tabs state
    const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

    // Profile Form State
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password Form State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!isOpen) return null;

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        try {
            const data = await updateUserProfile({
                userId: user?.id,
                firstName,
                lastName,
                avatar
            });

            // Refetch or update context
            // Assuming the context allows re-setting user data via 'login' method even if we just update user
            // We need the token. Currently context doesn't expose getting token easily unless we stored it.
            // But we can just use the storage.
            const token = localStorage.getItem('token');
            if (token && data.user) {
                login(token, data.user);
            }

            alert('Profile updated successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setIsPasswordLoading(true);
        setPasswordMessage(null);

        try {
            await changePassword({
                userId: user?.id,
                newPassword
            });

            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Failed to change password', error);
            setPasswordMessage({ type: 'error', text: 'Failed to update password' });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check size (e.g. 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image too large. Max 2MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
                {/* Header with Tabs */}
                <div className="p-6 pb-0 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600 flex items-center gap-2">
                            Settings
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'general' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <User size={16} /> General
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'security' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <Lock size={16} /> Security
                        </button>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'general' ? (
                            <motion.form
                                key="general"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleProfileSubmit}
                                className="space-y-6"
                            >
                                {/* Avatar Section */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                                            {avatar ? (
                                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={40} className="text-gray-300" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-teal-500 p-1.5 rounded-full border-2 border-white shadow-sm">
                                            <Camera size={12} className="text-white" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
                                            placeholder="Jane"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isProfileLoading}
                                        className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70"
                                    >
                                        <Save size={16} /> {isProfileLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="security"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onSubmit={handlePasswordSubmit}
                                className="space-y-6"
                            >
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex gap-3">
                                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg h-fit">
                                        <Lock size={16} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-yellow-800 mb-1">Change Password</h4>
                                        <p className="text-xs text-yellow-700">Ensure your account is using a long, random password to stay secure.</p>
                                    </div>
                                </div>

                                {passwordMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-xl border flex items-center gap-2 text-sm font-bold ${passwordMessage.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
                                    >
                                        {passwordMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                        {passwordMessage.text}
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isPasswordLoading}
                                        className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70"
                                    >
                                        <Save size={16} /> {isPasswordLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ProfileModal;
