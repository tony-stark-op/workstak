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
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Pull Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage code reviews and merges</p>
                </div>
                <Link href={`/repo/${name}/pull-requests/new`} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                    <Plus size={18} /> New Request
                </Link>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div className="flex-1 pl-2">Title</div>
                    <div className="w-32">Status</div>
                    <div className="w-48">Author</div>
                    <div className="w-32">Updated</div>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {prs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <GitPullRequest size={32} className="opacity-40" />
                            </div>
                            <p className="font-medium">No active pull requests found</p>
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
                                    className="block hover:bg-gray-50 rounded-xl px-6 py-4 transition-all group border border-transparent hover:border-gray-100"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-700 group-hover:text-indigo-600 transition-colors flex items-center gap-2 text-sm">
                                                <GitPullRequest size={16} className="text-gray-400 group-hover:text-indigo-500" />
                                                {pr.title}
                                                <span className="text-xs font-normal text-gray-400">#{pr._id.substring(pr._id.length - 4)}</span>
                                            </h3>
                                            <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-2 ml-6">
                                                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono border border-gray-200">{pr.sourceBranch}</span>
                                                <span className="text-gray-300">→</span>
                                                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono border border-gray-200">{pr.targetBranch}</span>
                                            </div>
                                        </div>
                                        <div className="w-32">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${pr.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' :
                                                pr.status === 'merged' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${pr.status === 'active' ? 'bg-green-500' : pr.status === 'merged' ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                                                {pr.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="w-48 flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700 font-bold border border-indigo-50">
                                                {pr.createdBy?.username?.[0] || 'U'}
                                            </div>
                                            <span className="font-medium text-xs">{pr.createdBy?.username || 'Unknown'}</span>
                                        </div>
                                        <div className="w-32 text-xs text-gray-400 flex items-center gap-1.5">
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
