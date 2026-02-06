'use client';

import { useEffect, useState } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable
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
import TaskDetailModal from '@/components/TaskDetailModal';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-indigo-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'review', title: 'Review', color: 'bg-purple-500' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' },
];

// Independent Droppable Column Component
function DroppableColumn({ id, title, color, count, children }: any) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="min-w-[320px] w-[320px] flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100/50">
            <div className="p-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${color}`}></div>
                    {title}
                </h3>
                <span className="text-xs font-semibold text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                    {count}
                </span>
            </div>
            <div className="px-4 pb-4 flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

function TaskCard({ task, onDelete, onClick }: { task: any, onDelete: (id: string) => void, onClick?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const priorityColors: any = {
        low: 'bg-emerald-50 text-emerald-600',
        medium: 'bg-amber-50 text-amber-600',
        high: 'bg-red-50 text-red-600'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`group relative p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer active:cursor-grabbing mb-3 animate-in fade-in duration-300`}
        >
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {/* Delete Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete task "${task.title}"?`)) {
                            onDelete(task._id);
                        }
                    }}
                    className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                >
                    <Trash2 size={13} />
                </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${priorityColors[task.priority] || 'bg-gray-100 text-gray-500'}`}>
                    {task.priority || 'Medium'}
                </span>
                {task.project && (
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                        {task.project}
                    </span>
                )}
            </div>

            <h4 className="text-[15px] font-bold text-gray-800 leading-snug mb-2 pr-6">
                {task.title}
            </h4>

            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                {task.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    {task.assignee ? (
                        <div className="flex items-center gap-2" title={`${task.assignee?.firstName} ${task.assignee?.lastName}`}>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[9px] text-white font-bold shadow-sm ring-1 ring-white">
                                {task.assignee?.firstName?.[0] || 'U'}
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">
                                {task.assignee?.firstName}
                            </span>
                        </div>
                    ) : (
                        <span className="text-[11px] text-gray-400 italic">Unassigned</span>
                    )}
                </div>

                <div className="text-[10px] font-medium text-gray-400">
                    {new Date().toLocaleDateString('en-US', { disable: true } as any) === 'Invalid Date' ? 'Today' : 'Today'}
                </div>
            </div>
        </div>
    );
}

export default function BoardPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [activeId, setActiveId] = useState(null);

    // Modals
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null); // For detail modal

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
            if (selectedTask?._id === id) setSelectedTask(null);
        } catch (err) {
            console.error('Failed to delete task', err);
            loadTasks();
        }
    };

    const handleUpdateTask = async (id: string, updates: any) => {
        try {
            const updated = await updateTask(id, updates);
            setTasks(prev => prev.map(t => t._id === id ? updated : t));
            if (selectedTask?._id === id) setSelectedTask(updated);
        } catch (err) {
            console.error(err);
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
            setIsNewModalOpen(false);
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
                <button onClick={() => setIsNewModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
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
                        <DroppableColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            color={col.color}
                            count={tasks.filter(t => t.status === col.id).length}
                        >
                            <SortableContext
                                items={tasks.filter(t => t.status === col.id).map(t => t._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onDelete={handleDeleteTask}
                                        onClick={() => setSelectedTask(task)}
                                    />
                                ))}
                            </SortableContext>
                            {tasks.filter(t => t.status === col.id).length === 0 && (
                                <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs font-medium">
                                    Drop items here
                                </div>
                            )}
                        </DroppableColumn>
                    ))}
                </div>
                <DragOverlay>
                    {activeId ? <TaskCard task={tasks.find(t => t._id === activeId)} onDelete={() => { }} /> : null}
                </DragOverlay>
            </DndContext>

            <NewTaskModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onSubmit={handleTaskSubmit}
            />

            <TaskDetailModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
}
