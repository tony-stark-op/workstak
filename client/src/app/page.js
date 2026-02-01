'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Folder, LogOut } from 'lucide-react';
import api from '@/api/axios';
import useAuthStore from '@/store/useAuthStore';

export default function Dashboard() {
  const { user, logout, isAuthenticated, initialize } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
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

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    },
    enabled: isAuthenticated // Only fetch if authenticated
  });

  const createProjectMutation = useMutation({
    mutationFn: async (newProject) => {
      return await api.post('/projects', newProject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setIsModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
    }
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    createProjectMutation.mutate({ name: newProjectName, description: newProjectDesc });
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  if (!isAuthenticated) return null; // Will redirect

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                WorkStak
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-zinc-400">Hi, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-zinc-500">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Link
                key={project._id}
                href={`/project/${project._id}`}
                className="group block p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-purple-500/50 hover:bg-zinc-800/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-zinc-800 rounded-lg group-hover:bg-purple-500/10 transition-colors">
                    <Folder className="text-purple-400" size={24} />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold group-hover:text-purple-300 transition-colors">
                  {project.name}
                </h3>
                <p className="mt-2 text-zinc-400 line-clamp-2">
                  {project.description || 'No description'}
                </p>
                <div className="mt-4 flex items-center text-sm text-zinc-500">
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}

            {projects?.length === 0 && (
              <div className="col-span-full text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500">No projects yet. Create one to get started!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-white"
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disable:opacity-50"
                >
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
