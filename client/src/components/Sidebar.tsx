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
                <div className="mt-auto px-6">
                    {/* Upgrade and Logout removed as per requirement */}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
