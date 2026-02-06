'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRepos, getUsers } from '@/lib/api';

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
    const [assignee, setAssignee] = useState(''); // Stores User ID
    const [project, setProject] = useState(''); // Stores Repo Name

    // Dynamic Data Choices
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Fetch data when modal opens
    useEffect(() => {
        if (isOpen) {
            loadFormOptions();
        }
    }, [isOpen]);

    const loadFormOptions = async () => {
        setIsLoadingData(true);
        try {
            const [reposData, usersData] = await Promise.all([
                getRepos(), // Using repos as projects for now
                getUsers()
            ]);
            setProjects(reposData);
            setUsers(usersData);

            // Set defaults if available
            if (reposData.length > 0 && !project) setProject(reposData[0].name);
            if (usersData.length > 0 && !assignee) setAssignee(usersData[0]._id);
        } catch (err) {
            console.error('Failed to load form options:', err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ title, description, priority, project, assignee, status: 'todo' });
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
                className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-lg p-8 relative z-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-gray-800 mb-1">
                    New Task
                </h2>
                <p className="text-sm text-gray-500 mb-6 font-medium">Add a new item to the board.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                            Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400 font-medium"
                            placeholder="e.g. Implement Auth Flow"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 placeholder:text-gray-400 font-medium h-24 resize-none"
                            placeholder="Details about the task..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 appearance-none font-medium"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                                Project
                            </label>
                            {/* Dynamic Project Dropdown */}
                            <select
                                value={project}
                                onChange={(e) => setProject(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 appearance-none font-medium"
                                disabled={isLoadingData}
                            >
                                {isLoadingData ? <option>Loading...</option> : projects.map(p => (
                                    <option key={p._id} value={p.name}>{p.name}</option>
                                ))}
                                {!isLoadingData && projects.length === 0 && <option value="">No Projects Available</option>}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
                                Assignee
                            </label>
                            <select
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 appearance-none font-medium"
                                disabled={isLoadingData}
                            >
                                {isLoadingData ? <option>Loading...</option> : users.map(u => (
                                    <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.username})</option>
                                ))}
                                {!isLoadingData && users.length === 0 && <option value="">No Users Found (Are you Admin?)</option>}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:scale-[1.02] transition-all flex items-center gap-2"
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
