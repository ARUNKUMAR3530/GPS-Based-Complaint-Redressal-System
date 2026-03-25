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
    const [error, setError] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const currentUser = AuthService.getCurrentUser();
    const isUser = currentUser && currentUser.roles && currentUser.roles.includes('ROLE_USER');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            let response;
            if (isUser) {
                response = await NotificationService.getUserNotifications();
            } else {
                response = await NotificationService.getNotifications();
            }
            // Safely handle the response — could be array or {data: array}
            const data = Array.isArray(response) ? response :
                Array.isArray(response?.data) ? response.data : [];
            setNotifications(data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            // Don't show error for 401 — the api interceptor handles redirect
            if (err.response?.status !== 401) {
                setError('Failed to load notifications');
                toast.error('Failed to load notifications');
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
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            window.dispatchEvent(new CustomEvent('notification-read'));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleReply = async (complaintId) => {
        if (!replyMessage.trim()) return;
        try {
            await ComplaintService.replyToRemark(complaintId, replyMessage);
            toast.success('Reply sent successfully');
            setReplyingTo(null);
            setReplyMessage('');
        } catch (err) {
            console.error('Error sending reply:', err);
            toast.error('Failed to send reply');
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleString();
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
        return (
            <div className="notifications-page">
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: '4rem', gap: '1rem', color: '#64748b'
                }}>
                    <div style={{
                        width: 40, height: 40,
                        border: '4px solid #e2e8f0',
                        borderTopColor: '#2563eb',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                    <p>Loading notifications...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="notifications-page">
                <div className="empty-state">
                    <AlertCircle size={48} style={{ color: '#ef4444' }} />
                    <p>{error}</p>
                    <button
                        onClick={fetchNotifications}
                        style={{
                            marginTop: '1rem', padding: '8px 20px',
                            background: '#2563eb', color: 'white',
                            border: 'none', borderRadius: '6px', cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
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
                                        <span className="type-label">
                                            {notification.type?.replace(/_/g, ' ')}
                                        </span>
                                        <span className="timestamp">
                                            {formatTimestamp(notification.createdAt)}
                                        </span>
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

                            {/* Reply button for admin REMARK notifications */}
                            {!isUser && notification.type === 'REMARK' && (
                                <div className="notification-actions">
                                    {replyingTo === notification.id ? (
                                        <div className="reply-box" onClick={(e) => e.stopPropagation()}>
                                            <textarea
                                                placeholder="Type your reply..."
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                            />
                                            <div className="reply-buttons">
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="cancel-btn"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleReply(
                                                        notification.complaint?.id || null
                                                    )}
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
