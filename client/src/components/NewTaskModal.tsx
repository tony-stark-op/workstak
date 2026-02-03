'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    projectIds?: string[]; // Todo: Pass real projects
}

const NewTaskModal = ({ isOpen, onClose, onSubmit }: NewTaskModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assignee, setAssignee] = useState(''); // Allow string for now or User ID
    const [project, setProject] = useState('workstack'); // Default project

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ title, description, priority, project, status: 'todo' });
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        onClose();
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
                className="glass-panel w-full max-w-lg p-6 relative z-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600 mb-1">
                    New Task
                </h2>
                <p className="text-sm text-gray-500 mb-6 font-medium">Add a new item to the board.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="glass-input w-full"
                            placeholder="e.g. Implement Auth Flow"
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
                            placeholder="Details about the task..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="glass-input w-full appearance-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">
                                Project
                            </label>
                            <input
                                type="text"
                                value={project}
                                onChange={(e) => setProject(e.target.value)}
                                className="glass-input w-full"
                                placeholder="Project Name"
                            />
                        </div>
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
                            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all flex items-center gap-2"
                        >
                            <Check size={16} /> Create Task
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default NewTaskModal;
