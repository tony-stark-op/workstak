'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function Shell({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!user || isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#F5F6FA]">
            {/* Fixed Sidebar */}
            <div className="fixed top-0 bottom-0 left-0 w-64 z-50">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 ml-64 p-8 transition-all duration-300">
                {/* Navbar is now part of the flow */}
                <Navbar />

                <main className="w-full max-w-[1400px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
