'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Users, CheckCircle, BarChart3 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function AnalyticsPage() {
    const [selectedProject, setSelectedProject] = useState(null);

    // Fetch Projects
    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => (await api.get('/projects')).data
    });

    // Set default project
    if (projects.length > 0 && !selectedProject) {
        setSelectedProject(projects[0]._id);
    }

    // Fetch Analytics for Selected Project
    const { data: analytics } = useQuery({
        queryKey: ['analytics', selectedProject],
        queryFn: async () => (await api.get(`/analytics/project/${selectedProject}`)).data,
        enabled: !!selectedProject
    });

    if (!selectedProject) return <div className="p-8 text-white">Loading projects...</div>;

    const pieData = {
        labels: analytics?.taskStatusDistribution.map(d => d._id) || [],
        datasets: [
            {
                data: analytics?.taskStatusDistribution.map(d => d.count) || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const barData = {
        labels: analytics?.userProductivity.map(d => d.name) || [],
        datasets: [
            {
                label: 'Tasks Completed',
                data: analytics?.userProductivity.map(d => d.count) || [],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="p-8 text-white min-h-screen pb-20">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center">
                    <BarChart3 className="mr-3 text-purple-500" />
                    Analytics Dashboard
                </h1>

                <select
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500"
                    value={selectedProject || ''}
                    onChange={(e) => setSelectedProject(e.target.value)}
                >
                    {projects.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Task Distribution */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <CheckCircle className="mr-2 text-green-500" size={20} />
                        Task Distribution
                    </h2>
                    <div className="h-64 flex justify-center">
                        {analytics?.taskStatusDistribution.length > 0 ? (
                            <Pie data={pieData} />
                        ) : (
                            <p className="text-zinc-500 self-center">No task data available</p>
                        )}
                    </div>
                </div>

                {/* Team Productivity */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 flex items-center">
                        <Users className="mr-2 text-blue-500" size={20} />
                        Team Velocity (Completed Tasks)
                    </h2>
                    <div className="h-64 flex justify-center">
                        {analytics?.userProductivity.length > 0 ? (
                            <Bar
                                data={barData}
                                options={{
                                    responsive: true,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: { color: '#9ca3af' },
                                            grid: { color: '#374151' }
                                        },
                                        x: {
                                            ticks: { color: '#9ca3af' },
                                            grid: { display: false }
                                        }
                                    },
                                    plugins: {
                                        legend: { display: false },
                                    }
                                }}
                            />
                        ) : (
                            <p className="text-zinc-500 self-center">No completion data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
