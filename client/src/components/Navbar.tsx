'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import UserMenuPopup from './UserMenuPopup';
import NotificationsDropdown from './NotificationsDropdown';
import ProfileModal from './ProfileModal';

const Navbar = () => {
    const { user } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Helper to get display name parts
    const nameParts = user?.username?.split(' ') || ['User'];
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[1] : '';

    return (
        <>
            <header className="flex items-center justify-between py-6 px-2 mb-8">
                {/* Left: Page Title or Welcome */}
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-800">
                        My Courses
                    </h1>
                    {/* Optional subtext */}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-6">
                    {/* Search Bar (Mock) */}
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Search size={22} />
                    </button>

                    {/* Notification Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                            <Bell size={22} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F5F6FA]"></span>
                        </button>
                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <NotificationsDropdown
                                    isOpen={isNotificationsOpen}
                                    onClose={() => setIsNotificationsOpen(false)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User Profile */}
                    <div className="relative">
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        >
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-800">{firstName} {lastName}</div>
                                <div className="text-xs text-gray-400">1094881999</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                {/* Mock Avatar or Initials */}
                                <img src="https://i.pravatar.cc/150?img=32" alt="User" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <UserMenuPopup
                                    isOpen={isUserMenuOpen}
                                    onClose={() => setIsUserMenuOpen(false)}
                                    onUpdateProfile={() => setIsProfileModalOpen(true)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
};

export default Navbar;
