import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log(`[API Req] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        console.log(`[API Res] ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(`[API Err] ${error.response?.status} ${error.config?.url}`, error.response?.data);
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/auth'; // Redirect to login
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const loginUser = (data: any) => api.post('/auth/login', data).then(res => res.data);
export const registerUser = (data: any) => api.post('/auth/register', data).then(res => res.data);
export const changePassword = (data: any) => api.post('/auth/change-password', data).then(res => res.data);
export const getUsers = () => api.get('/auth/users').then(res => res.data);
export const updateUserProfile = (data: any) => api.put('/auth/profile', data).then(res => res.data); // New

export const getRepos = () => api.get('/repos').then(res => res.data);
export const createRepo = (data: any) => api.post('/repos', data).then(res => res.data);

// Git View API
export const getCommits = (name: string, branch = 'master') => api.get(`/repos/${name}/commits?branch=${branch}`).then(res => res.data);
export const getTree = (name: string, sha = 'master') => api.get(`/repos/${name}/tree?sha=${encodeURIComponent(sha)}`).then(res => res.data);
export const compareBranches = (name: string, base: string, head: string) => api.get(`/repos/${name}/compare`, { params: { base, head } }).then(res => res.data);
export const getBlob = (name: string, sha: string) => api.get(`/repos/${name}/blob/${sha}`).then(res => res.data);
export const getBranches = (name: string) => api.get(`/repos/${name}/branches`).then(res => res.data);
export const createBranch = (name: string, data: any) => api.post(`/repos/${name}/branches`, data).then(res => res.data);
export const deleteBranch = (name: string, branch: string) => api.delete(`/repos/${name}/branches/${encodeURIComponent(branch)}`).then(res => res.data);
export const deleteRepo = (name: string) => api.delete(`/repos/${name}`).then(res => res.data);
export const updateFile = (name: string, data: any) => api.post(`/repos/${name}/files`, data).then(res => res.data);

// Task API
export const getTasks = (project?: string) => api.get('/tasks', { params: { project } }).then(res => res.data);
export const createTask = (data: any) => api.post('/tasks', data).then(res => res.data);
export const updateTask = (id: string, data: any) => api.patch(`/tasks/${id}`, data).then(res => res.data);
export const deleteTask = (id: string) => api.delete(`/tasks/${id}`).then(res => res.data); // New

// PR API
export const getPRs = (repoName: string, status = 'active') => api.get(`/repos/${repoName}/prs`, { params: { status } }).then(res => res.data);
export const createPR = (repoName: string, data: any) => api.post(`/repos/${repoName}/prs`, data).then(res => res.data);
export const getPRDetails = (repoName: string, id: string) => api.get(`/repos/${repoName}/prs/${id}`).then(res => res.data);
export const getPRDiff = (repoName: string, id: string) => api.get(`/repos/${repoName}/prs/${id}/diff`).then(res => res.data);
export const mergePR = (repoName: string, id: string) => api.post(`/repos/${repoName}/prs/${id}/merge`).then(res => res.data);

// AI API
export const refineCode = (data: { code: string; instruction: string }) => api.post('/ai/refine', data).then(res => res.data);

export default api;
