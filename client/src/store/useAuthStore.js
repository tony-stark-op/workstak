import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    login: (user, token) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
        set({ user, token, isAuthenticated: true });
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
        set({ user: null, token: null, isAuthenticated: false });
    },

    setUser: (user) => set({ user }),
    setToken: (token) => set({ token, isAuthenticated: !!token }),

    // Helper to initialize from local storage
    initialize: () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                set({ token, isAuthenticated: true });
            }
        }
    }
}));

export default useAuthStore;
