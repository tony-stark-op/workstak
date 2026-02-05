'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPRDetails, getPRDiff, mergePR } from '@/lib/api';
import { GitPullRequest, CheckCircle, XCircle, ArrowLeft, Clock, GitMerge } from 'lucide-react';
import Link from 'next/link';

export default function PullRequestDetailsPage() {
    const { name, id } = useParams();
    const [pr, setPr] = useState<any>(null);
    const [diff, setDiff] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'files'>('overview');
    const [isMerging, setIsMerging] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const prData = await getPRDetails(name as string, id as string);
            setPr(prData);
            const diffData = await getPRDiff(name as string, id as string);
            setDiff(diffData.diff);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMerge = async () => {
        if (!confirm('Are you sure you want to merge this pull request?')) return;

        setIsMerging(true);
        try {
            await mergePR(name as string, id as string);
            // Reload PR details to show updated status
            await loadData();
        } catch (err) {
            console.error('Merge failed:', err);
            alert('Failed to merge PR');
        } finally {
            setIsMerging(false);
        }
    };

    if (!pr) return <div className="p-8">Loading...</div>;

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="mb-6">
                <Link href={`/repo/${name}/pull-requests`} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-2 transition-colors text-sm font-bold">
                    <ArrowLeft size={14} /> Back
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
                            {pr.title} <span className="text-gray-400 font-normal">#{id.toString().substring(18)}</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${pr.status === 'active' ? 'bg-green-100 text-green-700' :
                                pr.status === 'merged' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-500'
                                }`}>
                                <GitPullRequest size={16} /> {pr.status.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
                                <span className="text-gray-900 font-bold">{pr.createdBy?.firstName} {pr.createdBy?.lastName}</span> wants to merge
                                <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-700 font-mono text-xs mx-1">{pr.sourceBranch}</span>
                                into
                                <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-700 font-mono text-xs mx-1">{pr.targetBranch}</span>
                            </span>
                        </div>
                    </div>
                    {pr.status === 'active' && (
                        <button
                            onClick={handleMerge}
                            disabled={isMerging}
                            className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-200 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 text-sm"
                        >
                            <GitMerge size={16} />
                            {isMerging ? 'Merging...' : 'Merge Pull Request'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 font-bold text-sm transition-all ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={`pb-3 font-bold text-sm transition-all ${activeTab === 'files' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Files Changed
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden grid grid-cols-4 gap-6">
                {activeTab === 'overview' ? (
                    <>
                        <div className="col-span-3 overflow-y-auto pr-2">
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 mb-6">
                                <h3 className="font-bold text-gray-900 mb-3 text-lg">Description</h3>
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm bg-gray-50 rounded-xl p-6 border border-gray-100">
                                    {pr.description || 'No description provided.'}
                                </div>
                            </div>

                            {/* Timeline Placeholder */}
                            <div className="relative pl-8 border-l-2 border-gray-200 space-y-8 ml-4">
                                <div className="relative">
                                    <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-white border-[3px] border-gray-300"></div>
                                    <div className="text-xs text-gray-500">
                                        <span className="font-bold text-gray-900">{pr.createdBy?.username}</span> created this pull request <span className="text-gray-400 ml-2"><Clock size={10} className="inline mr-1" /> just now</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-1 space-y-6">
                            {/* Linked Tasks */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    Connected Tasks
                                </h3>
                                {pr.tasks && pr.tasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {pr.tasks.map((task: any) => (
                                            <div key={task._id} className="p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer shadow-sm">
                                                <div className="truncate w-full">
                                                    <p className="text-xs font-bold text-gray-700 group-hover:text-indigo-700 truncate mb-1">{task.title}</p>
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] text-gray-500 capitalize bg-gray-100 px-1.5 rounded">{task.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-400 italic">No tasks linked</div>
                                )}
                            </div>

                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">Reviewers</h3>
                                <div className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-xl text-center border-dashed border border-gray-200">No reviewers assigned</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="col-span-4 h-full overflow-hidden flex flex-col">
                        <div className="bg-[#1e1e1e] rounded-[24px] shadow-sm border border-gray-800 flex-1 overflow-auto p-0 text-gray-300 font-mono text-sm leading-relaxed">
                            {/* Simple Diff Viewer */}
                            <div className="bg-[#2d2d2d] px-6 py-3 border-b border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wider sticky top-0">
                                File Changes
                            </div>
                            {diff ? (
                                <pre className="p-6">{diff}</pre>
                            ) : (
                                <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <GitMerge size={24} className="opacity-50" />
                                    </div>
                                    No changes detected or binary files.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
