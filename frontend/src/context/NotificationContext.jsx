import React, { createContext, useState, useCallback, useEffect } from 'react';
import notificationService from '../services/notification.service';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children, currentUser }) => {
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);
  const [unreadUserCount, setUnreadUserCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch admin notifications
  const fetchAdminNotifications = useCallback(async () => {
    if (!currentUser || !currentUser.roles.includes('ROLE_ADMIN')) return;
    try {
      const response = await notificationService.getNotifications();
      setAdminNotifications(response);
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
    }
  }, [currentUser]);

  // Fetch user notifications
  const fetchUserNotifications = useCallback(async () => {
    if (!currentUser || currentUser.roles.includes('ROLE_ADMIN')) return;
    try {
      const response = await notificationService.getUserNotifications();
      setUserNotifications(response);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
    }
  }, [currentUser]);

  // Fetch unread counts
  const fetchUnreadCounts = useCallback(async () => {
    if (!currentUser) return;

    try {
      if (currentUser.roles.includes('ROLE_ADMIN')) {
        const count = await notificationService.getUnreadCount();
        setUnreadAdminCount(count);
      } else {
        const count = await notificationService.getUserUnreadCount();
        setUnreadUserCount(count);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  }, [currentUser]);

  // Mark admin notification as read
  const markAdminAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setAdminNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadAdminCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking admin notification as read:', error);
    }
  }, []);

  // Mark user notification as read
  const markUserAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markUserNotificationAsRead(notificationId);
      setUserNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadUserCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking user notification as read:', error);
    }
  }, []);

  // Add real-time notification (from WebSocket)
  const addAdminNotification = useCallback((notification) => {
    setAdminNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadAdminCount((prev) => prev + 1);
    }
  }, []);

  const addUserNotification = useCallback((notification) => {
    setUserNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadUserCount((prev) => prev + 1);
    }
  }, []);

  // Initial load on mount
  useEffect(() => {
    if (currentUser) {
      fetchAdminNotifications();
      fetchUserNotifications();
      fetchUnreadCounts();
    }
  }, [currentUser, fetchAdminNotifications, fetchUserNotifications, fetchUnreadCounts]);

  const value = {
    adminNotifications,
    userNotifications,
    unreadAdminCount,
    unreadUserCount,
    wsConnected,
    setWsConnected,
    fetchAdminNotifications,
    fetchUserNotifications,
    fetchUnreadCounts,
    markAdminAsRead,
    markUserAsRead,
    addAdminNotification,
    addUserNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
