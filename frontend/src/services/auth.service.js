import api from './api';
import { jwtDecode } from "jwt-decode"; // Correct import for v4

const register = (username, email, password, fullName, mobile) => {
    return api.post('/auth/register', {
        username,
        email,
        password,
        fullName,
        mobile
    });
};

const login = (username, password) => {
    return api.post('/auth/login', {
        username,
        password,
    })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        });
};

const adminLogin = (username, password) => {
    return api.post('/auth/admin/login', {
        username,
        password,
    })
        .then((response) => {
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.setItem('token', response.data.token);
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload(); // Simple way to reset state
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const changePassword = (password) => {
    return api.post('/auth/admin/change-password', {
        password
    });
};

const AuthService = {
    register,
    login,
    adminLogin,
    logout,
    getCurrentUser,
    changePassword
};

export default AuthService;
