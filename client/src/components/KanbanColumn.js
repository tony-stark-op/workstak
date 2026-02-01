'use client';

import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import clsx from 'clsx';

const KanbanColumn = ({ id, title, tasks, onTaskClick }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id
    });

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-300 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    {title}
                    <span className="ml-2 text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                        {tasks.length}
                    </span>
                </h3>
            </div>

            <div
                ref={setNodeRef}
                className={clsx(
                    "flex-1 bg-zinc-900/50 rounded-xl p-3 border border-zinc-800/50 transition-colors overflow-y-auto min-h-[500px]",
                    isOver && "bg-purple-900/10 border-purple-500/20"
                )}
            >
                <div className="space-y-3">
                    {tasks.map(task => (
                        <TaskCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
                    ))}
                    {tasks.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 text-sm">
                            Drop tasks here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanColumn;
