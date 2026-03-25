import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Bell } from 'lucide-react';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service';
import useWebSocket from '../hooks/useWebSocket';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const dropdownRef = useRef(null);

    // Load initial notifications
    const loadNotifications = useCallback(async () => {
        if (!currentUser) return;
        try {
            const isAdmin = currentUser.roles?.some(r =>
                ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_MUNICIPALITY_ADMIN'].includes(r)
            );
            const res = isAdmin
                ? await NotificationService.getNotifications()
                : await NotificationService.getUserNotifications();
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error(error);
        }
    }, [currentUser]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Listen for notification-read events from other components (e.g., Notifications page)
    useEffect(() => {
        const handleNotificationRead = () => loadNotifications();
        window.addEventListener('notification-read', handleNotificationRead);
        return () => window.removeEventListener('notification-read', handleNotificationRead);
    }, [loadNotifications]);

    // WebSocket: real-time notifications
    const topic = useMemo(() => {
        if (!currentUser) return null;
        return `/topic/notifications/${currentUser.id}`;
    }, [currentUser]);

    const handleNewNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    }, []);

    useWebSocket(topic, handleNewNotification);

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await NotificationService.markAsRead(notification.id);
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, isRead: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Failed to mark as read", error);
            }
        }

        setShowDropdown(false);
        navigate('/admin/notifications');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <header className="header">
            <div className="header-content">
                <div className="notification-wrapper" ref={dropdownRef}>
                    <div
                        className="notification-icon"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        )}
                    </div>

                    {showDropdown && (
                        <div className="notification-dropdown">
                            <div className="dropdown-header">
                                <h3>Notifications</h3>
                            </div>
                            <div className="dropdown-body">
                                {notifications.length === 0 ? (
                                    <div className="no-notifications">No notifications</div>
                                ) : (
                                    notifications.slice(0, 10).map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="notification-message">{notification.message}</div>
                                            <div className="notification-time">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile">
                    <span>{currentUser?.username || 'Admin'}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
