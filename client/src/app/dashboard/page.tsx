'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRepos, getTasks, getPRs } from '@/lib/api';
import { motion } from 'framer-motion';
import { GitBranch, ChevronRight, Plus, Activity, Star } from 'lucide-react';
import { ActiveTasksWidget, OpenPRsWidget, SystemVelocityWidget, CommitActivityWidget } from '@/components/KPIWidgets';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [repos, setRepos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // KPI Data States
    const [activeTaskCount, setActiveTaskCount] = useState(0);
    const [activePRCount, setActivePRCount] = useState(0);
    const [velocityData, setVelocityData] = useState({ done: 0, total: 0 });

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // 1. Repos (Just top 3 for quick access)
            const repoData = await getRepos();
            setRepos(repoData.slice(0, 3));

            // 2. Tasks & Velocity
            const tasks = await getTasks();

            // Calculate System Velocity (Global)
            const doneCount = tasks.filter((t: any) => t.status === 'done').length;
            setVelocityData({
                done: doneCount,
                total: tasks.length
            });

            // Calculate My Active Tasks (User Specific)
            // Filter by status 'in-progress' and assignee matching current user
            const myActiveTasks = tasks.filter((t: any) =>
                t.status === 'in-progress' &&
                t.assignee?._id === user?.id || t.assignee === user?.id
            );
            setActiveTaskCount(myActiveTasks.length);


            // 3. Active PRs - Aggregate
            let totalActivePRs = 0;
            for (const repo of repoData) {
                try {
                    const prData = await getPRs(repo.name, 'active');
                    totalActivePRs += prData.length;
                } catch (err) {
                    console.warn(`Failed to fetch PRs for ${repo.name}:`, err);
                }
            }
            setActivePRCount(totalActivePRs);

        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.firstName}!</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActiveTasksWidget count={activeTaskCount} isLoading={isLoading} delay={0.1} />
                <OpenPRsWidget count={activePRCount} isLoading={isLoading} delay={0.2} />
                <SystemVelocityWidget done={velocityData.done} total={velocityData.total} isLoading={isLoading} delay={0.3} />
                <CommitActivityWidget delay={0.4} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Pinned Repos */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Star size={20} className="text-yellow-400 fill-yellow-400" />
                            Recent Projects
                        </h2>
                        <button onClick={() => router.push('/repositories')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="h-40 bg-white rounded-[24px] animate-pulse"></div>
                        ) : repos.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 dashboard-card">
                                No recent projects found.
                            </div>
                        ) : (
                            repos.map((repo, i) => (
                                <motion.div
                                    key={repo._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    onClick={() => router.push(`/repo/${repo.name}`)}
                                    className="dashboard-card p-6 cursor-pointer group flex flex-col md:flex-row gap-6 items-center md:items-start"
                                >
                                    <div className="w-full md:w-48 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center shrink-0">
                                        <GitBranch size={32} className="text-indigo-400" />
                                    </div>

                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{repo.name}</h3>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <ChevronRight size={18} />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                            {repo.description || 'No description provided.'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Quick Actions */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="dashboard-card p-6"
                    >
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-indigo-500" />
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {/* Mock Activity */}
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-700">You pushed to <span className="font-bold">master</span></p>
                                    <p className="text-xs text-gray-400">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-700">Merged PR <span className="font-bold">#42</span></p>
                                    <p className="text-xs text-gray-400">5 hours ago</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-700">Created new task <span className="font-bold">Update UI</span></p>
                                    <p className="text-xs text-gray-400">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="dashboard-card p-4 space-y-3"
                    >
                        <button onClick={() => router.push('/repositories')} className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                            <Plus size={18} />
                            Create New Project
                        </button>
                        <button onClick={() => router.push('/board')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2">
                            <Plus size={18} />
                            Create New Task
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
