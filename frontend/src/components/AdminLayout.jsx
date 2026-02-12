import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AuthService from '../services/auth.service';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        if (currentUser && currentUser.passwordChanged === false && currentUser.roles.includes("ROLE_ADMIN")) {
            navigate('/admin/change-password');
        }
    }, [currentUser, navigate]);

    return (
        <div className="admin-layout">
            <Sidebar />
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
