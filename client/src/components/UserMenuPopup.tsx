'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserMenuPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdateProfile: () => void;
}

const UserMenuPopup = ({ isOpen, onClose, onUpdateProfile }: UserMenuPopupProps) => {
    const { logout, user } = useAuth(); // Assuming user is available here

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            ></div>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 flex flex-col gap-2"
            >
                <div className="px-2 py-2 mb-2 border-b border-white/30">
                    <p className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <button
                    onClick={() => {
                        onUpdateProfile();
                        onClose();
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl text-gray-600 hover:bg-white/50 hover:text-teal-700 transition-colors text-sm font-medium"
                >
                    <Settings size={18} />
                    Update Profile
                </button>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 p-2 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors text-sm font-medium"
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </motion.div>
        </>
    );
};

export default UserMenuPopup;
