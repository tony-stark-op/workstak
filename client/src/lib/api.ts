import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api', // TODO: Use env
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const loginUser = (data: any) => api.post('/auth/login', data).then(res => res.data);
export const registerUser = (data: any) => api.post('/auth/register', data).then(res => res.data);
export const changePassword = (data: any) => api.post('/auth/change-password', data).then(res => res.data);

export const getRepos = () => api.get('/repos').then(res => res.data);
export const createRepo = (data: any) => api.post('/repos', data).then(res => res.data);

export const getCommits = (name: string, branch = 'master') => api.get(`/repos/${name}/commits?branch=${branch}`).then(res => res.data);
export const getTree = (name: string, sha = 'master') => api.get(`/repos/${name}/tree/${sha}`).then(res => res.data);
export const getBlob = (name: string, sha: string) => api.get(`/repos/${name}/blob/${sha}`).then(res => res.data);

// Task API
export const getTasks = (project?: string) => api.get('/tasks', { params: { project } }).then(res => res.data);
export const createTask = (data: any) => api.post('/tasks', data).then(res => res.data);
export const updateTask = (id: string, data: any) => api.patch(`/tasks/${id}`, data).then(res => res.data);

// PR API
export const getPRs = (repoName: string, status = 'active') => api.get(`/repos/${repoName}/prs`, { params: { status } }).then(res => res.data);
export const createPR = (repoName: string, data: any) => api.post(`/repos/${repoName}/prs`, data).then(res => res.data);
export const getPRDetails = (repoName: string, id: string) => api.get(`/repos/${repoName}/prs/${id}`).then(res => res.data);
export const getPRDiff = (repoName: string, id: string) => api.get(`/repos/${repoName}/prs/${id}/diff`).then(res => res.data);

export default api;
