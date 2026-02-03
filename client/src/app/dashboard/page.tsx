'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    GitBranch,
    GitPullRequest,
    Activity,
    Clock,
    Plus,
    FolderGit2,
    Zap,
    Layout,
    User
} from 'lucide-react';
import NewRepoModal from '@/components/NewRepoModal';
import { getRepos, getTasks, getPRs } from '@/lib/api';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [repos, setRepos] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Real Data States
    const [velocity, setVelocity] = useState(0);
    const [activePRs, setActivePRs] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // 1. Repos
            const repoData = await getRepos();
            setRepos(repoData);

            // 2. Velocity (Count of 'done' tasks)
            const tasks = await getTasks();
            const doneCount = tasks.filter((t: any) => t.status === 'done').length;
            setVelocity(doneCount);

            // 3. Active PRs (Fetch from first repo for demo, or aggregate?)
            // For now, let's just pick the first repo if exists to show *something*
            if (repoData.length > 0) {
                const prData = await getPRs(repoData[0].name); // Just fetches from first repo
                setActivePRs(prData);
            }

        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateRepo = async () => {
        await loadDashboardData();
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Overview of your development activity</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center gap-2 text-teal-700 font-bold">
                        <Plus size={18} /> New Project
                    </button>
                    <button onClick={() => router.push('/board')} className="glass-button flex items-center gap-2 text-purple-700 font-bold">
                        <Zap size={18} /> New Task
                    </button>
                    <button onClick={logout} className="glass-button text-red-500 font-bold">
                        Log Out
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Sprint Velocity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={64} className="text-teal-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                            <Activity size={20} />
                        </div>
                        <h3 className="font-bold text-gray-700">Sprint Velocity</h3>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-gray-800">{velocity} <span className="text-sm font-normal text-gray-500">tasks</span></div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-full rounded-full w-3/4"></div>
                        </div>
                    </div>
                </motion.div>

                {/* Active PRs Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <GitPullRequest size={64} className="text-purple-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <GitPullRequest size={20} />
                        </div>
                        <h3 className="font-bold text-gray-700">Active PRs</h3>
                    </div>
                    <div className="mt-4 space-y-3">
                        {activePRs.length === 0 ? (
                            <div className="text-sm text-gray-400 italic">No active pull requests</div>
                        ) : (
                            activePRs.slice(0, 2).map(pr => (
                                <div key={pr._id} className="flex items-center justify-between text-sm p-2 bg-white/40 rounded-lg cursor-pointer hover:bg-white/60 transition-colors"
                                    onClick={() => router.push(`/repo/${pr.repository}/pull-requests/${pr._id}`)}
                                >
                                    <span className="font-bold text-gray-700">{pr.title}</span>
                                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">#{pr._id.substring(pr._id.length - 3)}</span>
                                </div>
                            ))
                        )}
                        {activePRs.length > 2 && (
                            <div className="text-xs text-center text-gray-500 mt-2">+{activePRs.length - 2} more</div>
                        )}
                    </div>
                </motion.div>

                {/* Repos Widget */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FolderGit2 size={64} className="text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <FolderGit2 size={20} />
                        </div>
                        <h3 className="font-bold text-gray-700">Repositories</h3>
                    </div>
                    <div className="mt-4">
                        <div className="text-3xl font-bold text-gray-800">{repos.length} <span className="text-sm font-normal text-gray-500">projects</span></div>
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                            <Clock size={14} /> Updated just now
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Repos List */}
                <div className="lg:col-span-2 glass-panel">
                    <div className="p-6 border-b border-white/50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Your Projects</h3>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-white/50 rounded-lg text-gray-500"><Layout size={18} /></button>
                        </div>
                    </div>
                    <div className="divide-y divide-white/50">
                        {repos.map((repo: any) => (
                            <div
                                key={repo.name}
                                onClick={() => router.push(`/repo/${repo.name}`)}
                                className="p-4 hover:bg-white/40 transition-colors flex items-center justify-between cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform">
                                        <GitBranch size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-700 group-hover:text-teal-700 transition-colors">{repo.name}</h4>
                                        <p className="text-xs text-gray-500">Updated recently</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span>main</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">Private</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left p-3 hover:bg-white/60 rounded-xl flex items-center gap-3 transition-colors group">
                                <span className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform"><Plus size={16} /></span>
                                <span className="font-medium text-gray-700">New Snippet</span>
                            </button>
                            <button className="w-full text-left p-3 hover:bg-white/60 rounded-xl flex items-center gap-3 transition-colors group">
                                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><User size={16} /></span>
                                <span className="font-medium text-gray-700">Invite Team</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <NewRepoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onRepoCreated={handleCreateRepo}
            />
        </div>
    );
}
