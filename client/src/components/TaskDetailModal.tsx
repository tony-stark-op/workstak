'use client';

import { useState, useEffect } from 'react';
import { X, Check, Trash2, Calendar, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { getRepos, getUsers } from '@/lib/api';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any;
    onUpdate: (id: string, data: any) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const TaskDetailModal = ({ isOpen, onClose, task, onUpdate, onDelete }: TaskDetailModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('medium');
    const [assignee, setAssignee] = useState('');
    const [project, setProject] = useState('');
    const [status, setStatus] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Dynamic Data
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setPriority(task.priority || 'medium');
            setAssignee(task.assignee?._id || task.assignee || '');
            setProject(task.project || '');
            setStatus(task.status || 'todo');
            loadOptions();
        }
    }, [task, isOpen]);

    const loadOptions = async () => {
        try {
            const [reposData, usersData] = await Promise.all([
                getRepos(),
                getUsers()
            ]);
            setProjects(reposData);
            setUsers(usersData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onUpdate(task._id, {
                title,
                description,
                priority,
                assignee,
                project,
                status
            });
            setIsEditing(false);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this task?')) {
            await onDelete(task._id);
            onClose();
        }
    };

    if (!isOpen || !task) return null;

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
                className="bg-white rounded-[24px] shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                    <div className="flex-1 pr-4">
                        {isEditing ? (
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        ) : (
                            <h2 className="text-xl font-bold text-gray-800 leading-snug">{title}</h2>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${priority === 'high' ? 'bg-red-50 text-red-600' :
                                    priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                                        'bg-emerald-50 text-emerald-600'
                                }`}>
                                {priority}
                            </span>
                            {project && (
                                <span className="text-[10px] font-semibold text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-md">
                                    {project}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                Description
                            </h3>
                            {isEditing ? (
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 min-h-[120px] outline-none focus:border-indigo-300 transition-all font-medium"
                                />
                            ) : (
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {description || <span className='italic text-gray-400'>No description provided.</span>}
                                </p>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Assignee</label>
                                {isEditing ? (
                                    <select
                                        value={assignee}
                                        onChange={e => setAssignee(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-700 outline-none"
                                    >
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                            {users.find(u => u._id === assignee)?.firstName?.[0] || 'U'}
                                        </div>
                                        {users.find(u => u._id === assignee)?.firstName || 'Unassigned'}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Status</label>
                                {isEditing ? (
                                    <select
                                        value={status}
                                        onChange={e => setStatus(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-700 outline-none capitalize"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="review">Review</option>
                                        <option value="done">Done</option>
                                    </select>
                                ) : (
                                    <div className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${status === 'done' ? 'bg-emerald-500' :
                                                status === 'review' ? 'bg-purple-500' :
                                                    status === 'in-progress' ? 'bg-amber-500' :
                                                        'bg-indigo-500'
                                            }`}></div>
                                        {status === 'in-progress' ? 'In Progress' : status}
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5 block">Priority</label>
                                    <select
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-700 outline-none capitalize"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={handleDelete}
                        className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        <Trash2 size={14} /> Delete Task
                    </button>

                    <div className="flex gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition-colors shadow-sm"
                            >
                                Edit Task
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TaskDetailModal;
