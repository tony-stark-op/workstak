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
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-32 mr-6 my-6 flex flex-col">
                <Navbar />
                <main className="mt-24">
                    {children}
                </main>
            </div>
        </div>
    );
}
