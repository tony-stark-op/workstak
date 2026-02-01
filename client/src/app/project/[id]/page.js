'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragOverlay, closestCorners, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { ArrowLeft, Plus, GitBranch } from 'lucide-react';
import api from '@/api/axios';
import KanbanColumn from '@/components/KanbanColumn';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import RepoModal from '@/components/RepoModal';
import useAuthStore from '@/store/useAuthStore';

export default function ProjectBoardPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isAuthenticated, initialize } = useAuthStore();
    const queryClient = useQueryClient();
    const [activeTask, setActiveTask] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (isMounted && !isAuthenticated) {
            router.push('/login');
        }
    }, [isMounted, isAuthenticated, router]);

    // Fetch Project Details
    const { data: project } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => (await api.get(`/projects/${id}`)).data,
        enabled: !!id && isAuthenticated
    });

    // Fetch Tasks
    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks', id],
        queryFn: async () => (await api.get(`/tasks?projectId=${id}`)).data,
        enabled: !!id && isAuthenticated
    });

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }) => {
            return await api.put(`/tasks/${taskId}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks', id]);
        }
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        })
    );

    const onDragStart = (event) => {
        setActiveTask(event.active.data.current);
    };

    const onDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id;
        const newStatus = over.id;

        const task = tasks.find(t => t._id === taskId);
        if (task && task.status !== newStatus) {
            updateTaskMutation.mutate({ taskId, status: newStatus });
        }
    };

    const columns = ['Todo', 'In Progress', 'Review', 'Done'];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const handleNewTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleTaskClick = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    if (!isMounted) return null;
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-zinc-400" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">{project?.name || 'Loading...'}</h1>
                            <p className="text-xs text-zinc-500">{project?.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsRepoModalOpen(true)}
                            className="flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-sm transition-colors border border-zinc-700"
                        >
                            <GitBranch size={16} className="text-purple-400" />
                            <span className="hidden sm:inline">Repos</span>
                        </button>
                        <button
                            onClick={handleNewTask}
                            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg text-sm transition-colors">
                            <Plus size={16} />
                            <span className="hidden sm:inline">New Task</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Kanban Board */}
            <main className="flex-1 overflow-x-auto p-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    <div className="flex space-x-6 h-full min-w-[1000px]">
                        {columns.map(status => (
                            <div key={status} className="w-80 flex-shrink-0">
                                <KanbanColumn
                                    id={status}
                                    title={status}
                                    tasks={tasks.filter(t => t.status === status)}
                                    onTaskClick={handleTaskClick}
                                />
                            </div>
                        ))}
                    </div>
                    <DragOverlay>
                        {activeTask ? <TaskCard task={activeTask} /> : null}
                    </DragOverlay>
                </DndContext>
            </main>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={id}
                task={editingTask}
            />

            {project && (
                <RepoModal
                    isOpen={isRepoModalOpen}
                    onClose={() => setIsRepoModalOpen(false)}
                    project={project}
                />
            )}
        </div>
    );
}
