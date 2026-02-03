'use client';

import { useAuth } from '@/context/AuthContext';
import { Bell, Search, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="fixed top-6 left-36 right-6 h-20 bg-white/40 backdrop-blur-lg border border-white/50 shadow-lg rounded-[24px] flex items-center justify-between px-8 z-40">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    Welcome back, {user?.username} 👋
                </h1>
                <p className="text-sm text-gray-500 font-medium">Let's build something amazing today.</p>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group">
                    <Search size={20} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="bg-white/60 pl-10 pr-4 py-2 rounded-xl text-sm border-none outline-none ring-1 ring-transparent focus:ring-teal-200/50 focus:bg-white transition-all w-64 shadow-sm placeholder-gray-400/80"
                    />
                </div>

                <button className="relative p-2.5 bg-white/60 rounded-xl hover:bg-white hover:shadow-md transition-all text-gray-500 hover:text-teal-600">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-400 rounded-full ring-2 ring-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-white/30">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-gray-800">{user?.username}</div>
                        <div className="text-xs text-gray-500">Pro Member</div>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full p-0.5 shadow-md">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                            <UserIcon size={20} className="text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
