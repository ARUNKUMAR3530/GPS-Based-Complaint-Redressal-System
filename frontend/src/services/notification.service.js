import api from './api';

const getNotifications = () => {
    return api.get('/notifications');
};

const getUnreadCount = () => {
    return api.get('/notifications/unread-count');
};

const markAsRead = (id) => {
    return api.put(`/notifications/${id}/read`);
};

const getUserNotifications = () => {
    return api.get('/notifications/user');
};

const getUserUnreadCount = () => {
    return api.get('/notifications/user/unread-count');
};

const markUserNotificationAsRead = (id) => {
    return api.put(`/notifications/user/${id}/read`);
};

const NotificationService = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    getUserNotifications,
    getUserUnreadCount,
    markUserNotificationAsRead
};

export default NotificationService;
