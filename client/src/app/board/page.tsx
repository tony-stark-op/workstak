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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTasks, createTask, updateTask } from '@/lib/api';
import { Plus, MoreHorizontal } from 'lucide-react';
import NewTaskModal from '@/components/NewTaskModal';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-red-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-500' },
    { id: 'review', title: 'Review', color: 'bg-blue-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' },
];

function TaskCard({ task }: { task: any }) {
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
            className="glass-card p-4 mb-3 bg-white/70 hover:bg-white/90 cursor-grab active:cursor-grabbing border-l-4 border-l-teal-500"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{task.project}</span>
                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={14} /></button>
            </div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">{task.title}</h4>
            <div className="flex justify-between items-center mt-3">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-400 border-2 border-white flex items-center justify-center text-[8px] text-white">JD</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {task.priority}
                </span>
            </div>
        </div>
    );
}

export default function BoardPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [activeId, setActiveId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
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

    const handleDragEnd = async (event: any) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id; // Could be a task ID or a column ID

        // Find the task
        const task = tasks.find(t => t._id === activeId);
        if (!task) return;

        // Determine new status
        let newStatus = task.status;
        const isOverColumn = COLUMNS.find(c => c.id === overId);

        if (isOverColumn) {
            newStatus = overId;
        } else {
            // Dragged over another task?
            const overTask = tasks.find(t => t._id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        // Optimistic Update
        const updatedTasks = tasks.map(t =>
            t._id === activeId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);

        // API Call
        if (newStatus !== task.status) {
            await updateTask(activeId, { status: newStatus });
        }
    };

    const handleTaskSubmit = async (taskData: any) => {
        try {
            // Call API to create task
            const newTask = await createTask(taskData);

            // Optimistically add to "To Do" column state
            setTasks(prev => [...prev, newTask]);

            // Close modal
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to create task:', err);
            // Optionally show error to user
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6 pl-2">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">Central Board</h1>
                    <p className="text-sm text-gray-500">Manage tasks across all projects</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="glass-button flex items-center gap-2 text-teal-700">
                    <Plus size={18} /> New Task
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={(e) => setActiveId(e.active.id as any)}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 overflow-x-auto pb-4 h-full">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="min-w-[300px] w-full glass-panel flex flex-col h-full bg-white/40">
                            <div className="p-4 flex items-center gap-2 border-b border-white/50">
                                <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                                <h3 className="font-bold text-gray-700 text-sm">{col.title}</h3>
                                <span className="ml-auto bg-white/50 px-2 py-0.5 rounded text-xs text-gray-500">
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto">
                                <SortableContext
                                    items={tasks.filter(t => t.status === col.id).map(t => t._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {tasks.filter(t => t.status === col.id).map(task => (
                                        <TaskCard key={task._id} task={task} />
                                    ))}
                                </SortableContext>

                                {tasks.filter(t => t.status === col.id).length === 0 && (
                                    <div className="h-24 border-2 border-dashed border-gray-300/50 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                                        Empty
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <DragOverlay>
                    {activeId ? <TaskCard task={tasks.find(t => t._id === activeId)} /> : null}
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
