import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize directly from localStorage — no async gap, no flash
    const [currentUser, setCurrentUser] = useState(() => AuthService.getCurrentUser());
    const [loading, setLoading] = useState(false); // No async loading needed

    // Re-sync if localStorage changes in another tab
    useEffect(() => {
        const syncUser = () => {
            setCurrentUser(AuthService.getCurrentUser());
        };
        window.addEventListener('storage', syncUser);
        return () => window.removeEventListener('storage', syncUser);
    }, []);

    const login = async (username, password) => {
        const data = await AuthService.login(username, password);
        setCurrentUser(data);
        return data;
    };

    const adminLogin = async (username, password) => {
        const data = await AuthService.adminLogin(username, password);
        setCurrentUser(data);
        return data;
    };

    const logout = () => {
        AuthService.logout();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, adminLogin, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
