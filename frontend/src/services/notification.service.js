import axios from 'axios';
import AuthService from './auth.service';

const API_URL = "http://localhost:8080/api/notifications";

const getNotifications = () => {
    return axios.get(API_URL, { headers: AuthService.authHeader() });
};

const getUnreadCount = () => {
    return axios.get(API_URL + "/unread-count", { headers: AuthService.authHeader() });
};

const markAsRead = (id) => {
    return axios.put(API_URL + `/${id}/read`, {}, { headers: AuthService.authHeader() });
};

const NotificationService = {
    getNotifications,
    getUnreadCount,
    markAsRead
};

export default NotificationService;
