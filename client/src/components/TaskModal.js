'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Sparkles, FileText } from 'lucide-react';
import api from '@/api/axios';
import UserSelect from './UserSelect';

const TaskModal = ({ isOpen, onClose, projectId, task = null }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        status: 'Todo',
        assignee: null
    });
    const [summary, setSummary] = useState('');
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                priority: task.priority,
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
                status: task.status,
                assignee: task.assignee?._id || task.assignee || null
            });
            // Fetch summary if exists or generate new if requested
        } else {
            setFormData({
                title: '',
                description: '',
                priority: 'Medium',
                dueDate: '',
                status: 'Todo',
                assignee: null
            });
            setSummary('');
        }
    }, [task, isOpen]);

    const createTaskMutation = useMutation({
        mutationFn: async (newTask) => {
            // 1. Create Task
            const res = await api.post('/tasks', { ...newTask, projectId });
            const createdTask = res.data;

            // 2. Upload File if exists
            if (file) {
                const fileData = new FormData();
                fileData.append('file', file);
                // We'd need to associate it, but for now just upload
                await api.post('/files/upload', fileData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            return createdTask;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', projectId]);
            onClose();
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: async (updatedData) => {
            return await api.put(`/tasks/${task._id}`, updatedData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', projectId]);
            onClose();
        }
    });

    const generateSummary = async () => {
        if (!task) return; // Only for existing tasks for now
        setIsGeneratingAi(true);
        try {
            const res = await api.post('/ai/summary', { taskId: task._id });
            setSummary(res.data.summary);
        } catch (err) {
            console.error("AI Error", err);
        } finally {
            setIsGeneratingAi(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (task) {
            updateTaskMutation.mutate(formData);
        } else {
            createTaskMutation.mutate(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold">{task ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="Task Title"
                                required
                                className="w-full bg-transparent text-2xl font-bold focus:outline-none placeholder-zinc-600"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Status</label>
                                <select
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Priority</label>
                                <select
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Assignee</label>
                                <UserSelect
                                    selectedUserId={formData.assignee}
                                    onChange={(id) => setFormData({ ...formData, assignee: id })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-purple-500"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Description</label>
                            <textarea
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 h-32 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Add detailed description..."
                            />
                        </div>

                        {/* AI Summary Section */}
                        {task && (
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="flex items-center text-purple-300 font-semibold">
                                        <Sparkles size={16} className="mr-2" />
                                        AI Summary
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={generateSummary}
                                        disabled={isGeneratingAi}
                                        className="text-xs bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-white transition-colors disabled:opacity-50"
                                    >
                                        {isGeneratingAi ? 'Generating...' : 'Generate New'}
                                    </button>
                                </div>
                                <p className="text-sm text-zinc-300 italic">
                                    {summary || "Click generate to get an AI-powered summary of this task."}
                                </p>
                            </div>
                        )}

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Attachments</label>
                            <div className="flex items-center space-x-2">
                                <label className="cursor-pointer flex items-center space-x-2 bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700">
                                    <Upload size={16} />
                                    <span className="text-sm">Upload File</span>
                                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                </label>
                                {file && <span className="text-sm text-zinc-400">{file.name}</span>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-zinc-800">
                            <button
                                type="submit"
                                className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                            >
                                {task ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
