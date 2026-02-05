'use client';

import {
    Home,
    Folder,
    GitBranch,
    Settings,
    LogOut,
    Layout,
    GitMerge,
    MessageSquare,
    Users,
    Calendar
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
        { icon: Folder, label: 'Repositories', href: '/repositories' },
        { icon: GitMerge, label: 'Pull Requests', href: '/pull-requests' },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#4F46E5] text-white flex flex-col py-8 z-50 shadow-2xl rounded-r-[40px]">
            <div className="mb-12 px-8 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="font-bold text-white">W</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">WorkStack</h1>
            </div>

            <nav className="flex-1 flex flex-col w-full px-4 gap-2">
                <div className="px-4 mb-2 text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                    Menu
                </div>
                {navItems.map((item) => {
                    // Simple active check
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <item.icon size={20} className={isActive ? 'opacity-100' : 'opacity-70'} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-6">
                <div className="bg-indigo-700/50 rounded-2xl p-4 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                    <h3 className="font-semibold text-sm mb-1">Upgrade Pro</h3>
                    <p className="text-xs text-indigo-200 mb-3">Get full access to all features</p>
                    <button className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                        Upgrade Now
                    </button>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center gap-3 text-indigo-200 hover:text-white transition-colors text-sm font-medium px-2"
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
