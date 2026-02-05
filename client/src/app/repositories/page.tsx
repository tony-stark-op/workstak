'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRepos } from '@/lib/api';
import { motion } from 'framer-motion';
import { GitBranch, ChevronRight, Plus, Search } from 'lucide-react';
import CreateRepoModal from '@/components/CreateRepoModal';

export default function RepositoriesPage() {
    const router = useRouter();
    const [repos, setRepos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadRepos();
    }, []);

    const loadRepos = async () => {
        setIsLoading(true);
        try {
            const data = await getRepos();
            setRepos(data);
        } catch (err) {
            console.error('Failed to load repos:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRepoCreated = (newRepo: any) => {
        // Refresh list
        loadRepos();
    };

    const filteredRepos = repos.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 pl-1">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Repositories</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and collaborate on your projects.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                    <Plus size={20} />
                    Create Project
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-gray-700 shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-28 bg-white rounded-[24px] animate-pulse border border-gray-100"></div>
                    ))
                ) : filteredRepos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 border-dashed">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <GitBranch size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">No repositories found</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by creating your first project repository.</p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-indigo-600 font-bold hover:underline"
                        >
                            Create New Project
                        </button>
                    </div>
                ) : (
                    filteredRepos.map((repo, i) => (
                        <motion.div
                            key={repo._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(`/repo/${repo.name}`)}
                            className="group bg-white p-6 rounded-[24px] border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-pointer flex items-center gap-6"
                        >
                            {/* Icon */}
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <GitBranch size={28} className="text-indigo-500" />
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-1">{repo.name}</h3>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1 mb-3">
                                    {repo.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg">
                                        {repo.isPrivate ? 'Private' : 'Public'}
                                    </span>
                                    {/* Mock stats - could be real if backend provided */}
                                    <span className="text-xs text-gray-400 font-medium">Updated recently</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <CreateRepoModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleRepoCreated}
            />
        </div>
    );
}
