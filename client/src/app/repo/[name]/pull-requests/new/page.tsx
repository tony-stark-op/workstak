'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPR, getBranches, getTasks, compareBranches } from '@/lib/api';
import { ArrowLeft, Check, GitMerge, FileText, LayoutList, GitCommit, FileCode, Info } from 'lucide-react';
import Link from 'next/link';

type Tab = 'overview' | 'commits' | 'files';

export default function NewPullRequestPage() {
    const { name } = useParams();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Branch State
    const [branches, setBranches] = useState<string[]>([]);
    const [sourceBranch, setSourceBranch] = useState('');
    const [targetBranch, setTargetBranch] = useState('master');

    // Comparison State
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [comparison, setComparison] = useState<{ commits: any[], diff: string } | null>(null);
    const [isLoadingComparison, setIsLoadingComparison] = useState(false);

    // Task State
    const [myTasks, setMyTasks] = useState<any[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]); // Task IDs

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        loadData();
    }, [name]);

    useEffect(() => {
        if (sourceBranch && targetBranch && sourceBranch !== targetBranch) {
            loadComparison();
        } else {
            setComparison(null);
        }
    }, [sourceBranch, targetBranch, name]);

    const loadData = async () => {
        setIsLoadingData(true);
        try {
            const [branchData, taskData] = await Promise.all([
                getBranches(name as string),
                getTasks(name as string)
            ]);

            setBranches(branchData);
            // Default Source: first non-master or just empty
            const feature = branchData.find((b: string) => b !== 'master' && b !== 'main');
            if (feature) setSourceBranch(feature);
            else if (branchData.length > 0) setSourceBranch(branchData[0]);

            // Default Target: master or main
            const mainBranch = branchData.find((b: string) => b === 'master' || b === 'main');
            if (mainBranch) setTargetBranch(mainBranch);
            else if (branchData.length > 0) setTargetBranch(branchData[0]);

            const relatedTasks = taskData.filter((t: any) => t.status !== 'done' && (t.project === name || !t.project));
            setMyTasks(relatedTasks);

        } catch (err) {
            console.error('Failed to load PR options', err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const loadComparison = async () => {
        setIsLoadingComparison(true);
        try {
            const data = await compareBranches(name as string, targetBranch, sourceBranch);
            setComparison(data);
        } catch (error) {
            console.error('Failed to load comparison', error);
        } finally {
            setIsLoadingComparison(false);
        }
    };

    const toggleTask = (taskId: string) => {
        if (selectedTasks.includes(taskId)) {
            setSelectedTasks(data => data.filter(id => id !== taskId));
        } else {
            setSelectedTasks(data => [...data, taskId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createPR(name as string, {
                title,
                description,
                sourceBranch,
                targetBranch,
                tasks: selectedTasks
            });
            router.push(`/repo/${name}/pull-requests`);
        } catch (error) {
            alert('Failed to create PR');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <Link href={`/repo/${name}/pull-requests`} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-bold text-sm">
                <ArrowLeft size={16} /> Back to Pull Requests
            </Link>

            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
                <h1 className="text-2xl font-bold mb-2 text-gray-900 tracking-tight">Create New Pull Request</h1>
                <p className="text-gray-500 mb-8">Choose branches to merge.</p>

                {/* Branch Selection */}
                <div className="flex items-center gap-4 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Source Branch</label>
                        <div className="relative group bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                            <GitMerge size={16} className="absolute left-3 top-3 text-gray-400" />
                            <select
                                value={sourceBranch}
                                onChange={e => setSourceBranch(e.target.value)}
                                className="bg-transparent outline-none w-full appearance-none py-2.5 pl-9 pr-4 text-sm font-medium text-gray-700 cursor-pointer"
                                disabled={isLoadingData}
                            >
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="text-gray-300 mt-6"><ArrowLeft className="rotate-180" size={20} /></div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Target Branch</label>
                        <div className="relative group bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                            <GitMerge size={16} className="absolute left-3 top-3 text-indigo-500" />
                            <select
                                value={targetBranch}
                                onChange={e => setTargetBranch(e.target.value)}
                                className="bg-transparent outline-none w-full appearance-none py-2.5 pl-9 pr-4 text-sm font-medium text-gray-700 cursor-pointer"
                                disabled={isLoadingData}
                            >
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-6">
                    {(['overview', 'commits', 'files'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-4 text-sm font-bold capitalize transition-all border-b-2 ${activeTab === tab
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {tab === 'overview' && <Info size={16} />}
                                {tab === 'commits' && <GitCommit size={16} />}
                                {tab === 'files' && <FileCode size={16} />}
                                {tab}
                                {tab === 'commits' && comparison && (
                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">{comparison.commits.length}</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 text-lg font-bold placeholder:text-gray-300 placeholder:font-normal"
                                placeholder="e.g. Add Authentication Middleware"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 h-40 resize-none leading-relaxed placeholder:text-gray-300"
                                placeholder="Describe your changes..."
                            />
                        </div>

                        {/* Task Linking */}
                        <div className="border-t border-gray-100 pt-6">
                            <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <LayoutList size={16} className="text-indigo-600" /> Link Tasks <span className="text-xs font-normal text-gray-500">(Optional)</span>
                            </label>

                            {isLoadingData ? (
                                <p className="text-sm text-gray-500">Loading tasks...</p>
                            ) : myTasks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {myTasks.map(task => (
                                        <div
                                            key={task._id}
                                            onClick={() => toggleTask(task._id)}
                                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${selectedTasks.includes(task._id) ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition-colors ${selectedTasks.includes(task._id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                                                {selectedTasks.includes(task._id) && <Check size={10} className="text-white" />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${selectedTasks.includes(task._id) ? 'text-indigo-900' : 'text-gray-700'}`}>{task.title}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{task.status}</span>
                                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium border border-gray-200">{task.priority}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No active tasks found for this project.</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Pull Request'}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'commits' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {isLoadingComparison ? (
                            <div className="text-center py-8 text-gray-400">Loading commits...</div>
                        ) : !comparison || comparison.commits.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <GitCommit className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-500">No commits found between these branches.</p>
                            </div>
                        ) : (
                            comparison.commits.map((commit: any) => (
                                <div key={commit.hash} className="p-4 rounded-xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all flex items-start gap-4">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs ring-4 ring-white">
                                            {commit.author[0]}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-gray-800">{commit.message}</p>
                                            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{commit.hash.substring(0, 7)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span>{commit.author}</span>
                                            <span>&bull;</span>
                                            <span>{new Date(commit.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'files' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {isLoadingComparison ? (
                            <div className="text-center py-8 text-gray-400">Loading diff...</div>
                        ) : !comparison || !comparison.diff ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <FileCode className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-500">No file changes detected.</p>
                            </div>
                        ) : (
                            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-inner font-mono text-sm leading-relaxed overflow-x-auto">
                                <pre className="p-6 text-gray-300">
                                    {comparison.diff.split('\n').map((line, i) => {
                                        if (line.startsWith('+')) return <div key={i} className="text-green-400 bg-green-400/10 -mx-6 px-6">{line}</div>;
                                        if (line.startsWith('-')) return <div key={i} className="text-red-400 bg-red-400/10 -mx-6 px-6">{line}</div>;
                                        if (line.startsWith('@@')) return <div key={i} className="text-purple-400 bg-purple-400/10 -mx-6 px-6 py-2 my-1 font-bold">{line}</div>;
                                        return <div key={i}>{line}</div>;
                                    })}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
