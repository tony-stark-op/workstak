'use client';

import { useEffect, useState } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/api';
import { Plus, Trash2 } from 'lucide-react';
import NewTaskModal from '@/components/NewTaskModal';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-indigo-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

function TaskCard({ task, onDelete }: { task: any, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="dashboard-card p-4 mb-3 cursor-grab active:cursor-grabbing border-l-4 border-l-indigo-500 group relative shadow-sm hover:shadow-md bg-white"
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete task "${task.title}"? This will send a notification.`)) {
                            onDelete(task._id);
                        }
                    }}
                    className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="flex justify-between items-start mb-2 pr-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{task.project}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {task.priority}
                </span>
            </div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">{task.title}</h4>
            <div className="flex justify-between items-center mt-3 border-t border-gray-50 pt-2">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] text-gray-600 font-bold">
                        {task.assignee?.firstName?.[0] || task.assignee?.username?.[0] || 'U'}
                    </div>
                </div>
                <div className="text-[10px] text-gray-400">
                    Due Today
                </div>
            </div>
        </div>
    );
}

export default function BoardPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [activeId, setActiveId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const data = await getTasks();
            setTasks(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        try {
            setTasks(prev => prev.filter(t => t._id !== id));
            await deleteTask(id);
        } catch (err) {
            console.error('Failed to delete task', err);
            loadTasks();
        }
    };

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        const task = tasks.find(t => t._id === activeId);
        if (!task) return;

        let newStatus = task.status;
        const isOverColumn = COLUMNS.find(c => c.id === overId);

        if (isOverColumn) {
            newStatus = overId;
        } else {
            const overTask = tasks.find(t => t._id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        const updatedTasks = tasks.map(t =>
            t._id === activeId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);
        setActiveId(null);

        if (newStatus !== task.status) {
            await updateTask(activeId, { status: newStatus });
        }
    };

    const handleTaskSubmit = async (taskData: any) => {
        try {
            const newTask = await createTask(taskData);
            setTasks(prev => [...prev, newTask]);
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-8 pl-1">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Task Board</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage project workflows and track progress.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Plus size={18} /> New Task
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={(e) => setActiveId(e.active.id as any)}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4 h-full pr-4">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="min-w-[320px] w-[320px] flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100/50">
                            <div className="p-4 flex items-center justify-between">
                                <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                    {col.title}
                                </h3>
                                <span className="text-xs font-semibold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </div>

                            <div className="px-4 pb-4 flex-1 overflow-y-auto">
                                <SortableContext
                                    items={tasks.filter(t => t.status === col.id).map(t => t._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {tasks.filter(t => t.status === col.id).map(task => (
                                        <TaskCard key={task._id} task={task} onDelete={handleDeleteTask} />
                                    ))}
                                </SortableContext>
                                {tasks.filter(t => t.status === col.id).length === 0 && (
                                    <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium">
                                        No Tasks
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <DragOverlay>
                    {activeId ? <TaskCard task={tasks.find(t => t._id === activeId)} onDelete={() => { }} /> : null}
                </DragOverlay>
            </DndContext>

            <NewTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleTaskSubmit}
            />
        </div>
    );
}
