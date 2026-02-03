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
                <Link href={`/repo/${name}/pull-requests`} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-2 transition-colors text-sm">
                    <ArrowLeft size={14} /> Back
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            {pr.title} <span className="text-gray-400 font-normal">#{id.toString().substring(18)}</span>
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${pr.status === 'active' ? 'bg-green-100 text-green-700' :
                                    pr.status === 'merged' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-500'
                                }`}>
                                <GitPullRequest size={16} /> {pr.status.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-sm flex items-center gap-1">
                                <span className="font-bold text-gray-700">{pr.createdBy?.firstName} {pr.createdBy?.lastName}</span> wants to merge
                                <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-mono text-xs mx-1">{pr.sourceBranch}</span>
                                into
                                <span className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-mono text-xs mx-1">{pr.targetBranch}</span>
                            </span>
                        </div>
                    </div>
                    {pr.status === 'active' && (
                        <button
                            onClick={handleMerge}
                            disabled={isMerging}
                            className="glass-button bg-teal-600/10 text-teal-700 hover:bg-teal-600 hover:text-white border-teal-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            <GitMerge size={16} />
                            {isMerging ? 'Merging...' : 'Merge Pull Request'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={`pb-3 font-medium text-sm transition-colors ${activeTab === 'files' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Files Changed
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden grid grid-cols-4 gap-6">
                {activeTab === 'overview' ? (
                    <>
                        <div className="col-span-3 overflow-y-auto pr-2">
                            <div className="glass-panel p-6 mb-6">
                                <h3 className="font-bold text-gray-700 mb-2">Description</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{pr.description || 'No description provided.'}</p>
                            </div>

                            {/* Timeline Placeholder */}
                            <div className="relative pl-8 border-l-2 border-gray-200 space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-gray-200 border-2 border-white"></div>
                                    <div className="text-sm text-gray-500">
                                        <span className="font-bold text-gray-700">{pr.createdBy?.username}</span> created this pull request <span className="text-xs text-gray-400 ml-2"><Clock size={10} className="inline" /> just now</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-1 space-y-4">
                            <div className="glass-panel p-4">
                                <h3 className="font-bold text-xs text-gray-500 uppercase tracking-wide mb-3">Reviewers</h3>
                                <div className="text-sm text-gray-400 italic">No reviewers assigned</div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="col-span-4 h-full overflow-hidden flex flex-col">
                        <div className="glass-panel flex-1 overflow-auto p-0 bg-[#1e1e1e] text-gray-300 font-mono text-sm leading-relaxed">
                            {/* Simple Diff Viewer */}
                            {diff ? (
                                <pre className="p-4">{diff}</pre>
                            ) : (
                                <div className="p-8 text-center text-gray-500">No changes detected or binary files.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
