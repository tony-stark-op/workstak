'use client';

import { useEffect, useState } from 'react';
import { getRepos, getPRs } from '@/lib/api';
import { GitPullRequest, GitMerge, Clock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalPullRequestsPage() {
    const [prs, setPrs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadAllPRs();
    }, []);

    const loadAllPRs = async () => {
        setIsLoading(true);
        try {
            const repos = await getRepos();
            let allPrs: any[] = [];

            // Fetch PRs for all repos
            // Note: In a real app this should be a single API call
            for (const repo of repos) {
                try {
                    const repoPrs = await getPRs(repo.name);
                    // Add repo name to each PR for display
                    const prsWithRepo = repoPrs.map((pr: any) => ({ ...pr, repoName: repo.name }));
                    allPrs = [...allPrs, ...prsWithRepo];
                } catch (e) {
                    console.warn(`Failed to fetch PRs for ${repo.name}`);
                }
            }

            setPrs(allPrs);
        } catch (error) {
            console.error('Failed to load PRs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 pl-1">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Pull Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Review and merge code across all repositories.</p>
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        <GitPullRequest size={20} className="text-indigo-600" />
                        All Pull Requests
                    </h2>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">{prs.length} Total</span>
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">Loading pull requests...</div>
                    ) : prs.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                <GitPullRequest size={32} />
                            </div>
                            <p className="text-gray-500 font-medium">No open pull requests found.</p>
                            <p className="text-sm text-gray-400">Good job! All caught up.</p>
                        </div>
                    ) : (
                        prs.map((pr) => (
                            <div
                                key={pr.id}
                                onClick={() => router.push(`/repo/${pr.repoName}/pull-requests/${pr._id}`)}
                                className="p-5 hover:bg-gray-50/80 transition-colors cursor-pointer group flex items-start gap-4"
                            >
                                <div className={`mt-1 p-2 rounded-lg ${pr.state === 'open' ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {pr.state === 'open' ? <GitPullRequest size={18} /> : <GitMerge size={18} />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{pr.title}</h3>
                                        <span className="text-xs text-gray-400 font-mono">#{pr._id.slice(-6)}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">{pr.body}</p>

                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">{pr.repoName}</span>
                                        <span className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden">
                                                <img src={`https://ui-avatars.com/api/?name=${pr.user?.login}&background=random`} alt="" />
                                            </div>
                                            {pr.user?.login}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(pr.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
