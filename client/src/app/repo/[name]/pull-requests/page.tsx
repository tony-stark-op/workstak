'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPRs } from '@/lib/api';
import { GitPullRequest, Plus, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PullRequestsPage() {
    const { name } = useParams();
    const [prs, setPrs] = useState<any[]>([]);

    useEffect(() => {
        loadPRs();
    }, [name]);

    const loadPRs = async () => {
        try {
            const data = await getPRs(name as string);
            setPrs(data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Pull Requests</h1>
                    <p className="text-sm text-gray-500">Manage code reviews and merges</p>
                </div>
                <Link href={`/repo/${name}/pull-requests/new`} className="glass-button flex items-center gap-2 text-teal-700 font-bold">
                    <Plus size={18} /> New Request
                </Link>
            </div>

            <div className="glass-panel flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/50 bg-white/40 flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <div className="flex-1">Title</div>
                    <div className="w-32">Status</div>
                    <div className="w-48">Author</div>
                    <div className="w-32">Updated</div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {prs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <GitPullRequest size={48} className="mb-4 opacity-50" />
                            <p>No active pull requests found</p>
                        </div>
                    ) : (
                        prs.map((pr, i) => (
                            <motion.div
                                key={pr._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    href={`/repo/${name}/pull-requests/${pr._id}`}
                                    className="block bg-white/40 hover:bg-white/70 border border-white/50 rounded-xl p-4 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-700 group-hover:text-teal-700 transition-colors flex items-center gap-2">
                                                <GitPullRequest size={16} className="text-teal-500" />
                                                {pr.title}
                                                <span className="text-xs font-normal text-gray-400">#{pr._id.substring(pr._id.length - 4)}</span>
                                            </h3>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-mono">{pr.sourceBranch}</span>
                                                <span>→</span>
                                                <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-mono">{pr.targetBranch}</span>
                                            </div>
                                        </div>
                                        <div className="w-32">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${pr.status === 'active' ? 'bg-green-100 text-green-700' :
                                                pr.status === 'merged' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                {pr.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="w-48 flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-teal-400 flex items-center justify-center text-[10px] text-white font-bold">
                                                {pr.createdBy?.username?.[0] || 'U'}
                                            </div>
                                            {pr.createdBy?.username || 'Unknown'}
                                        </div>
                                        <div className="w-32 text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(pr.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
