'use client';

import {
    Home,
    Folder,
    GitBranch,
    Sparkles,
    Settings,
    LogOut,
    Layout
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: Layout, label: 'Work Board', href: '/board' },
        { icon: GitBranch, label: 'Repos', href: '/dashboard' },
        { icon: Sparkles, label: 'AI Hub', href: '/ai' },
    ];

    return (
        <aside className="fixed left-6 top-6 bottom-6 w-24 bg-white/40 backdrop-blur-xl border border-white/50 shadow-xl rounded-[30px] flex flex-col items-center py-8 z-50">
            <div className="mb-10">
                <div className="w-12 h-12 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-2xl shadow-lg flex items-center justify-center text-white font-bold text-xl">
                    WS
                </div>
            </div>

            <nav className="flex-1 flex flex-col gap-6 w-full px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1 group">
                            <div className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-teal-600/90 text-white shadow-lg shadow-teal-500/30' : 'bg-white/30 text-gray-500 hover:bg-white/60 hover:text-teal-700 hover:shadow-md'}`}>
                                <item.icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
                            </div>
                            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-teal-800' : 'text-gray-400 group-hover:text-teal-700'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto flex flex-col gap-4 w-full px-4">
                <button className="p-3 rounded-2xl bg-white/30 text-gray-500 hover:bg-white/60 hover:text-purple-600 transition-all flex justify-center">
                    <Settings size={22} />
                </button>
                <button
                    onClick={logout}
                    className="p-3 rounded-2xl bg-white/30 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all flex justify-center"
                >
                    <LogOut size={22} />
                </button>
            </div>

            <div className="mt-6 text-[9px] text-gray-400 font-medium tracking-wide opacity-60">
                © 2026
            </div>
        </aside>
    );
};

export default Sidebar;
