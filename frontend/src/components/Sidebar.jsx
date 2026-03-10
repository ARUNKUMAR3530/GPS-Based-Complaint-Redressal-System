import React, { useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import {
    LayoutDashboard,
    List,
    Users,
    Activity,
    LogOut,
    ShieldCheck,
    X,
    Bell
} from 'lucide-react';
import './Sidebar.css';
import NotificationService from '../services/notification.service';
import useWebSocket from '../hooks/useWebSocket';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const isSuperAdmin = currentUser && currentUser.roles && currentUser.roles.includes("ROLE_SUPER_ADMIN");

    const [unreadCount, setUnreadCount] = React.useState(0);

    const fetchUnreadCount = useCallback(() => {
        if (!currentUser) return;

        if (currentUser.roles && currentUser.roles.includes("ROLE_USER")) {
            NotificationService.getUserUnreadCount()
                .then(res => setUnreadCount(res.data))
                .catch(() => { });
        } else {
            NotificationService.getUnreadCount()
                .then(res => setUnreadCount(res.data))
                .catch(() => { });
        }
    }, [currentUser]);

    // Stable topic string — only recalculates when currentUser changes
    const topic = useMemo(() => {
        if (!currentUser) return null;
        if (currentUser.roles && currentUser.roles.includes("ROLE_USER")) {
            return `/topic/user-notifications/${currentUser.id}`;
        }
        return `/topic/notifications/${currentUser.id}`;
    }, [currentUser]);

    // Stable callback ref via useWebSocket internals
    const handleNewNotification = useCallback(() => {
        setUnreadCount(prev => prev + 1);
    }, []);

    useWebSocket(topic, handleNewNotification);

    React.useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    // Listen for notification-read events from other components (e.g., Notifications page)
    React.useEffect(() => {
        const handleNotificationRead = () => fetchUnreadCount();
        window.addEventListener('notification-read', handleNotificationRead);
        return () => window.removeEventListener('notification-read', handleNotificationRead);
    }, [fetchUnreadCount]);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    // Guard against missing role info
    const getRoleLabel = () => {
        if (!currentUser || !currentUser.roles) return 'Admin';
        if (currentUser.roles.includes("ROLE_SUPER_ADMIN")) return 'Super Admin';
        if (currentUser.roles.includes("ROLE_MUNICIPALITY_ADMIN")) return 'Municipality Admin';
        return 'Department Admin';
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

                    <NavLink to="/admin/notifications" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                        <div className="nav-icon-wrapper">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="notification-badge">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span>Notifications</span>
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
                        <div className="user-avatar">
                            {currentUser?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="user-details">
                            <span className="username">{currentUser?.username || 'Unknown'}</span>
                            <span className="role">{getRoleLabel()}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
