'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, GitBranch, Plus, Trash2, ExternalLink } from 'lucide-react';
import api from '@/api/axios';

export default function RepoModal({ isOpen, onClose, project }) {
    const queryClient = useQueryClient();
    const [newRepo, setNewRepo] = useState({ name: '', url: '', type: 'github' });

    const updateProjectMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await api.put(`/projects/${project._id}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['project', project._id]);
            setNewRepo({ name: '', url: '', type: 'github' });
        }
    });

    const handleAddRepo = (e) => {
        e.preventDefault();
        const updatedRepos = [...(project.repositories || []), newRepo];
        updateProjectMutation.mutate({ repositories: updatedRepos });
    };

    const handleRemoveRepo = (repoId) => {
        const updatedRepos = project.repositories.filter(r => r._id !== repoId);
        updateProjectMutation.mutate({ repositories: updatedRepos });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold flex items-center">
                        <GitBranch className="mr-2 text-purple-500" />
                        Repositories
                    </h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Add New Repo Form */}
                    <form onSubmit={handleAddRepo} className="mb-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Add Repository</h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Repository Name (e.g. Frontend)"
                                required
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                value={newRepo.name}
                                onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                            />
                            <div className="flex space-x-2">
                                <select
                                    className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm outline-none"
                                    value={newRepo.type}
                                    onChange={(e) => setNewRepo({ ...newRepo, type: e.target.value })}
                                >
                                    <option value="github">GitHub</option>
                                    <option value="azure">Azure</option>
                                    <option value="gitlab">GitLab</option>
                                    <option value="bitbucket">Bitbucket</option>
                                </select>
                                <input
                                    type="url"
                                    placeholder="Repository URL"
                                    required
                                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={newRepo.url}
                                    onChange={(e) => setNewRepo({ ...newRepo, url: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={updateProjectMutation.isPending}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded py-2 text-sm font-medium transition-colors flex justify-center items-center"
                            >
                                <Plus size={16} className="mr-1" />
                                {updateProjectMutation.isPending ? 'Adding...' : 'Add Repository'}
                            </button>
                        </div>
                    </form>

                    {/* Repo List */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {project.repositories && project.repositories.length > 0 ? (
                            project.repositories.map((repo, index) => (
                                <div key={repo._id || index} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg group">
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium text-white">{repo.name}</span>
                                            <span className="text-[10px] uppercase px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-400 border border-zinc-600">
                                                {repo.type}
                                            </span>
                                        </div>
                                        <a
                                            href={repo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-purple-400 hover:text-purple-300 flex items-center mt-1 truncate max-w-[200px]"
                                        >
                                            <ExternalLink size={10} className="mr-1" />
                                            {repo.url}
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveRepo(repo._id)}
                                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-zinc-500 text-sm py-4">No repositories linked yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
