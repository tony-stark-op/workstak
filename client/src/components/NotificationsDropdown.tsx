'use client';

import { motion } from 'framer-motion';
import { Bell, Check, Trash2, GitBranch } from 'lucide-react';

interface NotificationsDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const notifications = [
    { id: 1, text: "Task #102 Deleted", icon: Trash2, color: "text-red-500", bg: "bg-red-100", time: "2 min ago" },
    { id: 2, text: "New Repo 'WorkStack' created", icon: GitBranch, color: "text-blue-500", bg: "bg-blue-100", time: "1 hour ago" },
    { id: 3, text: "Task 'Auth Flow' completed", icon: Check, color: "text-green-500", bg: "bg-green-100", time: "3 hours ago" },
];

const NotificationsDropdown = ({ isOpen, onClose }: NotificationsDropdownProps) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            ></div>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 flex flex-col gap-2 max-h-96 overflow-y-auto"
            >
                <div className="flex justify-between items-center px-2 mb-2">
                    <h3 className="font-bold text-gray-700 text-sm">Recent Activity</h3>
                    <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded cursor-pointer hover:bg-teal-100 transition-colors">Mark all read</span>
                </div>

                <div className="space-y-1">
                    {notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/40 transition-colors cursor-pointer group">
                            <div className={`p-2 rounded-lg ${notif.bg} ${notif.color} shrink-0 mt-0.5`}>
                                <notif.icon size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 group-hover:text-teal-800 transition-colors">{notif.text}</p>
                                <p className="text-xs text-gray-400">{notif.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </>
    );
};

export default NotificationsDropdown;
