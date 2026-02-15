import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import {
    LayoutDashboard,
    List,
    Users,
    Activity,
    LogOut,
    ShieldCheck,
    X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const isSuperAdmin = currentUser && currentUser.roles.includes("ROLE_SUPER_ADMIN");

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    return (
        <>
            {/* Overlay for mobile when sidebar is open */}
            <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}></div>

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo">
                        <ShieldCheck size={28} />
                        <span>AdminPortal</span>
                    </div>
                    <button className="mobile-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
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
                            <span className="role">
                                {currentUser.roles.includes("ROLE_SUPER_ADMIN") ? 'Super Admin' :
                                    currentUser.roles.includes("ROLE_MUNICIPALITY_ADMIN") ? 'Municipality Admin' :
                                        'Department Admin'}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside >
        </>
    );
};

export default Sidebar;
