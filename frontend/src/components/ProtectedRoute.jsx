import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ADMIN_ROLES = ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MUNICIPALITY_ADMIN'];

const ProtectedRoute = ({ adminOnly = false }) => {
    const { currentUser, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1.2rem', color: '#64748b' }}>
                Loading...
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly) {
        const hasAdminRole = currentUser.roles && ADMIN_ROLES.some(role => currentUser.roles.includes(role));
        if (!hasAdminRole) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
