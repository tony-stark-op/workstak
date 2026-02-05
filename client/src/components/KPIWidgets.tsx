'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, GitPullRequest, Layout, Activity, ArrowUpRight } from 'lucide-react';

interface WidgetProps {
    isLoading?: boolean;
    delay?: number;
}

interface ActiveTasksProps extends WidgetProps {
    count: number;
}

interface OpenPRsProps extends WidgetProps {
    count: number;
}

interface VelocityProps extends WidgetProps {
    done: number;
    total: number;
}

export const ActiveTasksWidget = ({ count, isLoading, delay = 0 }: ActiveTasksProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="dashboard-card p-6 relative overflow-hidden group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-teal-100/50 rounded-2xl text-teal-600">
                <Layout size={24} />
            </div>
            <div className="px-2 py-1 bg-teal-50 text-teal-600 text-xs font-bold rounded-lg">
                Active
            </div>
        </div>

        <div className="space-y-1">
            <h3 className="text-gray-500 font-medium text-sm">Active Tasks</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-800">
                    {isLoading ? '-' : count}
                </span>
            </div>
        </div>
    </motion.div>
);

export const OpenPRsWidget = ({ count, isLoading, delay = 0.1 }: OpenPRsProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="dashboard-card p-6 relative overflow-hidden group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-100/50 rounded-2xl text-purple-600">
                <GitPullRequest size={24} />
            </div>
            <div className="px-2 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-lg">
                Review
            </div>
        </div>

        <div className="space-y-1">
            <h3 className="text-gray-500 font-medium text-sm">Open PRs</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-800">
                    {isLoading ? '-' : count}
                </span>
            </div>
        </div>
    </motion.div>
);

export const SystemVelocityWidget = ({ done, total, isLoading, delay = 0.2 }: VelocityProps) => {
    const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="dashboard-card p-6 relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100/50 rounded-2xl text-blue-600">
                    <CheckCircle2 size={24} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-gray-500 font-medium text-sm">Velocity</h3>
                    <span className="text-4xl font-bold text-gray-800">{percentage}%</span>
                </div>

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: delay + 0.2 }}
                        className="h-full bg-blue-500 rounded-full"
                    />
                </div>
                <p className="text-xs text-gray-400 font-medium">{done}/{total} Tasks Completed</p>
            </div>
        </motion.div>
    );
};

export const CommitActivityWidget = ({ delay = 0.3 }: { delay?: number }) => {
    // Mock data for sparkline
    const data = [12, 18, 10, 24, 15, 28, 32];
    const max = Math.max(...data);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="dashboard-card p-6 relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-100/50 rounded-2xl text-orange-600">
                    <Activity size={24} />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={12} />
                    <span>+12%</span>
                </div>
            </div>

            <div className="space-y-1 mb-4">
                <h3 className="text-gray-500 font-medium text-sm">Commit Activity</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-800">32</span>
                </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-10 mt-auto">
                {data.map((value, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${(value / max) * 100}%` }}
                        transition={{ duration: 0.5, delay: delay + (i * 0.1) }}
                        className="flex-1 bg-orange-200 rounded-t-sm"
                    />
                ))}
            </div>
        </motion.div>
    );
};
