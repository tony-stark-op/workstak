'use client';

import { useEffect, useState } from 'react';
import { getRepos, createRepo } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    GitBranch,
    Clock,
    TrendingUp,
    GitPullRequest,
    Zap,
    FileCode,
    ArrowRight,
    Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [repos, setRepos] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newRepoName, setNewRepoName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
        if (user) {
            loadRepos();
        }
    }, [user, isLoading, router]);

    const loadRepos = async () => {
        try {
            const data = await getRepos();
            setRepos(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRepo({ name: newRepoName, description });
            setShowModal(false);
            setNewRepoName('');
            setDescription('');
            loadRepos();
        } catch (err) {
            alert('Failed to create repo');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Top Row: System Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 font-medium text-sm">Sprint Velocity</h3>
                            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600 mt-2">124 pts</div>
                        </div>
                        <div className="p-2 bg-teal-100/50 rounded-lg text-teal-700">
                            <Zap size={20} />
                        </div>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-1.5 mt-4">
                        <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">75% of sprint goal completed</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 font-medium text-sm">Active Pull Requests</h3>
                            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mt-2">4</div>
                        </div>
                        <div className="p-2 bg-purple-100/50 rounded-lg text-purple-700">
                            <GitPullRequest size={20} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-5 h-5 rounded-full border border-white" />
                            <span className="truncate">Fix login race condition</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" className="w-5 h-5 rounded-full border border-white" />
                            <span className="truncate">Update dependencies</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-gray-500 font-medium text-sm">Quick Actions</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <button onClick={() => setShowModal(true)} className="glass-button flex flex-col items-center justify-center py-4 gap-2 hover:bg-teal-50/50 border-teal-100/50 text-teal-800">
                            <Plus size={20} />
                            <span className="text-xs font-semibold">New Repo</span>
                        </button>
                        <button className="glass-button flex flex-col items-center justify-center py-4 gap-2 text-gray-700">
                            <FileCode size={20} />
                            <span className="text-xs font-semibold">New Snippet</span>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Repositories */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
                    <button className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
                        View all <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {repos.map((repo, i) => (
                        <Link href={`/repo/${repo.name}`} key={repo._id} className="block group">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-6 h-full flex flex-col relative overflow-hidden group-hover:border-teal-200/50 group-hover:shadow-teal-500/10"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-400/10 to-blue-400/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="p-2.5 bg-white/80 rounded-xl shadow-sm text-teal-600">
                                        <GitBranch size={20} />
                                    </div>
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${repo.isPrivate ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-teal-50 text-teal-600 border-teal-100'}`}>
                                        {repo.isPrivate ? 'Priv' : 'Pub'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">{repo.name}</h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{repo.description || 'No description provided.'}</p>

                                <div className="mt-auto pt-4 border-t border-gray-100/50 flex items-center justify-between text-xs text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                        <span>master</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}

                    {repos.length === 0 && (
                        <div className="col-span-full py-12 text-center glass-panel">
                            <p className="text-gray-500">No projects found. Launch your first one now!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal - Glass Style */}
            {showModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-8 max-w-md w-full"
                    >
                        <h2 className="text-2xl font-bold mb-1 from-teal-600 to-blue-600 bg-clip-text text-transparent bg-gradient-to-r">Initialize Project</h2>
                        <p className="text-gray-500 text-sm mb-6">Create a new Git repository for your next big idea.</p>

                        <form onSubmit={handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">Project Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newRepoName}
                                        onChange={e => setNewRepoName(e.target.value)}
                                        className="glass-input w-full"
                                        placeholder="e.g. quantum-engine"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="glass-input w-full h-24 resize-none"
                                        placeholder="What are you building?"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100/50 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all">Create Project</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
