import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Only redirect if it's NOT a login/register attempt
            const url = error.config?.url || '';
            const isAuthCall = url.includes('/auth/login') || 
                               url.includes('/auth/register') ||
                               url.includes('/auth/admin');
            
            if (!isAuthCall) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                const currentPath = window.location.pathname;
                const isAdminRoute = currentPath.startsWith('/admin');
                const loginPath = isAdminRoute 
                    ? '/admin/login?expired=true' 
                    : '/login?expired=true';
                if (!currentPath.includes('/login')) {
                    window.location.href = loginPath;
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
