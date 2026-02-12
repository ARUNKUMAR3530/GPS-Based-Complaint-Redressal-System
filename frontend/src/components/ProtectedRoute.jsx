import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { currentUser, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && !currentUser.roles.includes('ROLE_ADMIN')) {
        return <Navigate to="/dashboard" />; // Redirect normal users to their dashboard
    }

    return <Outlet />;
};

export default ProtectedRoute;
