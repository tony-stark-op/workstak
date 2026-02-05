'use client';

import { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import { createRepo } from '@/lib/api';

interface CreateRepoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newRepo: any) => void;
}

export default function CreateRepoModal({ isOpen, onClose, onSuccess }: CreateRepoModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = await createRepo({ name, description, isPrivate });
            onSuccess(data);
            onClose();
            // Reset form
            setName('');
            setDescription('');
            setIsPrivate(false);
        } catch (error) {
            console.error('Failed to create repo:', error);
            alert('Failed to create repository. Name might be taken.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FolderPlus size={20} className="text-indigo-600" />
                        Create Repository
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Repository Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-gray-800"
                            placeholder="my-awesome-project"
                        />
                        <p className="text-xs text-gray-400 mt-1 pl-1">Only letters, numbers, hyphens, and underscores.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-gray-800 h-24 resize-none"
                            placeholder="What is this project about?"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                        <input
                            type="checkbox"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            id="private-check"
                        />
                        <label htmlFor="private-check" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                            Private Repository
                        </label>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
