import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationService from '../services/notification.service';
import AuthService from '../services/auth.service';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (!currentUser) return;

        console.log("Header mounted for user:", currentUser);

        // Load initial notifications
        loadNotifications();

        // Setup WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            console.log("WebSocket Connected");
            const subscriptionPath = `/topic/notifications/${currentUser.id}`;
            console.log("Subscribing to:", subscriptionPath);

            // Subscribe to user-specific channel
            stompClient.subscribe(subscriptionPath, (message) => {
                console.log("Received message:", message.body);
                const notification = JSON.parse(message.body);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                // Play sound or show toast if needed
            });
        }, (error) => {
            console.error('STOMP error', error);
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await NotificationService.getNotifications();
            setNotifications(res.data);
            const count = res.data.filter(n => !n.read).length;
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            try {
                await NotificationService.markAsRead(notification.id);
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Failed to mark as read", error);
            }
        }

        setShowDropdown(false);
        // Redirect logic based on type or just to complaints
        navigate('/admin/complaints');
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
                            <span className="notification-badge">{unreadCount}</span>
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
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
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
                    {/* Can replicate user info here if needed, or keeping it minimal */}
                    <span>{currentUser.username}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
