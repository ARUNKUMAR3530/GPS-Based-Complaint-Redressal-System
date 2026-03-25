import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: ONLY auto-logout on 401 for protected routes
// NEVER redirect on auth calls — they handle errors themselves
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const url = error.config?.url || '';

            // Skip auth endpoints — login/register failures are handled by the page
            const isAuthCall =
                url.includes('/auth/login') ||
                url.includes('/auth/register') ||
                url.includes('/auth/admin') ||
                url.includes('/auth/change-password');

            if (!isAuthCall) {
                const token = localStorage.getItem('token');
                // Only redirect if the user HAD a token (was actually logged in)
                // This prevents redirect loops on unauthenticated pages
                if (token) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('/login')) {
                        const isAdminRoute = currentPath.startsWith('/admin');
                        window.location.href = isAdminRoute
                            ? '/admin/login?expired=true'
                            : '/login?expired=true';
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;