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

export const getRepos = () => api.get('/repos').then(res => res.data);
export const createRepo = (data: any) => api.post('/repos', data).then(res => res.data);

export const getCommits = (name: string, branch = 'master') => api.get(`/repos/${name}/commits?branch=${branch}`).then(res => res.data);
export const getTree = (name: string, sha = 'master') => api.get(`/repos/${name}/tree/${sha}`).then(res => res.data);
export const getBlob = (name: string, sha: string) => api.get(`/repos/${name}/blob/${sha}`).then(res => res.data);

// Task API
export const getTasks = (project?: string) => api.get('/tasks', { params: { project } }).then(res => res.data);
export const createTask = (data: any) => api.post('/tasks', data).then(res => res.data);
export const updateTask = (id: string, data: any) => api.patch(`/tasks/${id}`, data).then(res => res.data);

export default api;
