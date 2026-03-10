import api from './api';

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
    // Do NOT call window.location.reload() — let React Router handle navigation
};

const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        return null;
    }
};

const changePassword = (password) => {
    return api.post('/auth/change-password', {
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
