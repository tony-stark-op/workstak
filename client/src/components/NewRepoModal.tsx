'use client';

import { useState } from 'react';
import { X, Check, FolderGit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createRepo } from '@/lib/api';

interface NewRepoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRepoCreated: () => void;
}

const NewRepoModal = ({ isOpen, onClose, onRepoCreated }: NewRepoModalProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createRepo({ name, description, isPrivate });
            onRepoCreated();
            setName('');
            setDescription('');
            setIsPrivate(false);
            onClose();
        } catch (error) {
            console.error('Failed to create repo:', error);
            alert('Failed to create repository');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-lg p-8 relative z-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-600 mb-1">
                    New Repository
                </h2>
                <p className="text-sm text-gray-500 mb-6 font-medium">Initialize a new Git repository.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                            Repository Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 font-mono text-sm"
                            placeholder="my-awesome-project"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="glass-input w-full h-24 resize-none"
                            placeholder="What is this project about?"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isPrivate"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <label htmlFor="isPrivate" className="text-sm text-gray-700 font-medium select-none">
                            Private Repository
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-white/50 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Creating...' : <><FolderGit2 size={16} /> Create Repo</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default NewRepoModal;
