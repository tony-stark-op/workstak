'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPR } from '@/lib/api';
import { ArrowLeft, Check, GitMerge } from 'lucide-react';
import Link from 'next/link';

export default function NewPullRequestPage() {
    const { name } = useParams();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sourceBranch, setSourceBranch] = useState('feature/new-feature'); // Todo: Dropdown from branches
    const [targetBranch, setTargetBranch] = useState('master');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createPR(name as string, {
                title,
                description,
                sourceBranch,
                targetBranch
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
            <Link href={`/repo/${name}/pull-requests`} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-6 transition-colors">
                <ArrowLeft size={16} /> Back to Pull Requests
            </Link>

            <div className="glass-panel p-8">
                <h1 className="text-2xl font-bold mb-2">Create New Pull Request</h1>
                <p className="text-gray-500 mb-8">Choose branches to merge.</p>

                <div className="flex items-center gap-4 mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Source Branch</label>
                        <div className="glass-input flex items-center gap-2">
                            <GitMerge size={16} className="text-purple-500" />
                            <input
                                value={sourceBranch}
                                onChange={e => setSourceBranch(e.target.value)}
                                className="bg-transparent outline-none w-full"
                            />
                        </div>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Target Branch</label>
                        <div className="glass-input flex items-center gap-2">
                            <GitMerge size={16} className="text-teal-500" />
                            <input
                                value={targetBranch}
                                onChange={e => setTargetBranch(e.target.value)}
                                className="bg-transparent outline-none w-full"
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="glass-input w-full text-lg font-medium"
                            placeholder="e.g. Add Authentication Middleware"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="glass-input w-full h-40 resize-none"
                            placeholder="Describe your changes..."
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="glass-button bg-teal-600/10 text-teal-700 hover:bg-teal-600 hover:text-white border-teal-200"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Pull Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
