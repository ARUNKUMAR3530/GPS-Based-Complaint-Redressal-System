import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AuthService from '../services/auth.service';
import { Menu } from 'lucide-react';
import './AdminLayout.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Logic to enforce password change is removed as per request.
    // useEffect(() => {
    //     if (currentUser && currentUser.passwordChanged === false && currentUser.roles.includes("ROLE_ADMIN")) {
    //         navigate('/admin/change-password');
    //     }
    // }, [currentUser, navigate]);

    return (
        <div className="admin-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="main-content">
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open Menu"
                >
                    <Menu size={24} />
                </button>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
