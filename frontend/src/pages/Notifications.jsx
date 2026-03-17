import React, { useState, useEffect } from 'react';
import NotificationService from '../services/notification.service';
import ComplaintService from '../services/complaint.service';
import AuthService from '../services/auth.service';
import { Bell, Check, Clock, Reply, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const currentUser = AuthService.getCurrentUser();
    const isUser = currentUser && currentUser.roles && currentUser.roles.includes("ROLE_USER");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            let response;
            if (isUser) {
                response = await NotificationService.getUserNotifications();
            } else {
                response = await NotificationService.getNotifications();
            }
            setNotifications(response.data || []); // <-- add || [] fallback
        } catch (error) {
            // Don't crash — just show empty state
            console.error('Notifications error:', error);
            setNotifications([]);
            // Only show toast if it's not a 401 (401 is handled by interceptor)
            if (error.response?.status !== 401) {
                toast.error("Failed to load notifications");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            if (isUser) {
                await NotificationService.markUserNotificationAsRead(id);
            } else {
                await NotificationService.markAsRead(id);
            }
            // Update local state
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
            // Notify other components (Sidebar, Header) to refresh their unread counts
            window.dispatchEvent(new CustomEvent('notification-read'));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const handleReply = async (complaintId) => {
        if (!replyMessage.trim()) return;

        try {
            await ComplaintService.replyToRemark(complaintId, replyMessage);
            toast.success("Reply sent successfully");
            setReplyingTo(null);
            setReplyMessage('');
        } catch (error) {
            console.error("Error sending reply:", error);
            toast.error("Failed to send reply");
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const getIcon = (type) => {
        switch (type) {
            case 'REMARK': return <MessageSquare className="icon remark" size={20} />;
            case 'ADMIN_REPLY': return <Reply className="icon reply" size={20} />;
            case 'NEW_COMPLAINT': return <AlertCircle className="icon new-complaint" size={20} />;
            case 'STATUS_CHANGED': return <Clock className="icon status" size={20} />;
            default: return <Bell className="icon" size={20} />;
        }
    };

    if (loading) {
        return <div className="notifications-container">Loading...</div>;
    }

    return (
        <div className="notifications-page">
            <header className="page-header">
                <h1>Notifications</h1>
                <p>Stay updated on complaint progress and remarks</p>
            </header>

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <Bell size={48} />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
                            onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                        >
                            <div className="notification-content">
                                {getIcon(notification.type)}
                                <div className="text-content">
                                    <div className="notification-header">
                                        <span className="type-label">{notification.type.replace(/_/g, ' ')}</span>
                                        <span className="timestamp">{formatTimestamp(notification.createdAt)}</span>
                                    </div>
                                    <p className="message">{notification.message}</p>
                                    {notification.complaint && (
                                        <div className="complaint-ref">
                                            Ref: {notification.complaint.title}
                                        </div>
                                    )}
                                </div>
                                {!notification.isRead && <div className="unread-dot"></div>}
                            </div>

                            {!isUser && notification.type === 'REMARK' && (
                                <div className="notification-actions">
                                    {replyingTo === notification.id ? (
                                        <div className="reply-box" onClick={(e) => e.stopPropagation()}>
                                            <textarea
                                                placeholder="Type your reply..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            ></textarea>
                                            <div className="reply-buttons">
                                                <button onClick={() => setReplyingTo(null)} className="cancel-btn">Cancel</button>
                                                <button
                                                    onClick={() => handleReply(notification.complaint ? notification.complaint.id : null)}
                                                    className="send-btn"
                                                    disabled={!replyMessage.trim()}
                                                >
                                                    Send Reply
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            className="reply-trigger"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setReplyingTo(notification.id);
                                            }}
                                        >
                                            <Reply size={16} /> Reply
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
