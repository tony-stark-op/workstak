'use client';

import { useDraggable } from '@dnd-kit/core';
import { Calendar, FileText, User } from 'lucide-react';
import clsx from 'clsx';

const TaskCard = ({ task, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task._id,
        data: task
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const priorityColors = {
        Low: 'bg-green-500/10 text-green-400 border-green-500/20',
        Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        High: 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={onClick}
            className={clsx(
                "bg-zinc-800 p-4 rounded-lg border border-zinc-700 shadow-sm cursor-pointer hover:border-purple-500/50 transition-colors group",
                isDragging && "opacity-50 ring-2 ring-purple-500 rotate-2 z-50"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={clsx("text-xs font-medium px-2 py-0.5 rounded border", priorityColors[task.priority])}>
                    {task.priority}
                </span>
                {task.assignee && (
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white" title={task.assignee.name}>
                        {task.assignee.name.charAt(0)}
                    </div>
                )}
            </div>

            <h4 className="font-medium text-white mb-1 group-hover:text-purple-300 transition-colors">{task.title}</h4>

            <div className="flex items-center space-x-3 mt-3 text-zinc-500 text-xs">
                <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                </div>
                {/* Show attachment indicator if files exist (future) */}
            </div>
        </div>
    );
};

export default TaskCard;
