import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import {
    LayoutDashboard,
    List,
    Users,
    Activity,
    LogOut,
    ShieldCheck
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const isSuperAdmin = currentUser && !currentUser.departmentId && currentUser.roles.includes("ROLE_ADMIN");

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <ShieldCheck size={28} />
                    <span>AdminPortal</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/admin/complaints" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <List size={20} />
                    <span>Complaints</span>
                </NavLink>

                {isSuperAdmin && (
                    <>
                        <NavLink to="/admin/supervision" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <Activity size={20} />
                            <span>Work Status</span>
                        </NavLink>
                        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                            <Users size={20} />
                            <span>User Management</span>
                        </NavLink>
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">{currentUser?.username?.charAt(0).toUpperCase()}</div>
                    <div className="user-details">
                        <span className="username">{currentUser?.username}</span>
                        <span className="role">{isSuperAdmin ? 'Super Admin' : 'District Admin'}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
