package com.complaint.redressal.service;

import com.complaint.redressal.model.*;
import com.complaint.redressal.repository.NotificationRepository;
import com.complaint.redressal.repository.UserNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Create and broadcast admin notification (e.g., remark, reply)
     */
    @Transactional
    public Notification createAdminNotification(
            Admin sender,
            Admin receiver,
            String message,
            NotificationType type,
            Complaint complaint) {

        Notification notification = new Notification();
        notification.setSender(sender);
        notification.setReceiver(receiver);
        notification.setMessage(message);
        notification.setType(type);
        notification.setComplaint(complaint);
        notification.setIsRead(false);

        // Save to database
        Notification saved = notificationRepository.save(notification);

        // Broadcast via WebSocket
        notifyAdminViaWebSocket(receiver.getId(), saved);

        return saved;
    }

    /**
     * Create and broadcast user notification (e.g., status update, complaint created)
     */
    @Transactional
    public UserNotification createUserNotification(
            User user,
            Complaint complaint,
            NotificationType type,
            String message) {

        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setComplaint(complaint);
        notification.setType(type);
        notification.setMessage(message);
        notification.setIsRead(false);

        // Save to database
        UserNotification saved = userNotificationRepository.save(notification);

        // Broadcast via WebSocket
        notifyUserViaWebSocket(user.getId(), saved);

        return saved;
    }

    /**
     * Broadcast admin notification via WebSocket
     */
    public void notifyAdminViaWebSocket(Long adminId, Notification notification) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + adminId,
                    notification
            );
        } catch (Exception e) {
            // Log error but don't fail - notification is already saved
            e.printStackTrace();
        }
    }

    /**
     * Broadcast user notification via WebSocket
     */
    public void notifyUserViaWebSocket(Long userId, UserNotification notification) {
        try {
            messagingTemplate.convertAndSend(
                    "/topic/user-notifications/" + userId,
                    notification
            );
        } catch (Exception e) {
            // Log error but don't fail - notification is already saved
            e.printStackTrace();
        }
    }

    /**
     * Get all admin notifications for an admin
     */
    public List<Notification> getAdminNotifications(Admin admin) {
        return notificationRepository.findByReceiverOrderByCreatedAtDesc(admin);
    }

    /**
     * Get all user notifications for a user
     */
    public List<UserNotification> getUserNotifications(User user) {
        return userNotificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Get unread admin notification count
     */
    public Long getUnreadAdminCount(Admin admin) {
        return notificationRepository.countByReceiverAndIsReadFalse(admin);
    }

    /**
     * Get unread user notification count
     */
    public Long getUnreadUserCount(User user) {
        return userNotificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * Mark admin notification as read
     */
    @Transactional
    public void markAdminNotificationAsRead(Long notificationId) {
        notificationRepository.findById(notificationId)
                .ifPresent(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                });
    }

    /**
     * Mark user notification as read
     */
    @Transactional
    public void markUserNotificationAsRead(Long notificationId) {
        userNotificationRepository.findById(notificationId)
                .ifPresent(notification -> {
                    notification.setIsRead(true);
                    userNotificationRepository.save(notification);
                });
    }

    /**
     * Mark all unread notifications as read for an admin
     */
    @Transactional
    public void markAllAdminNotificationsAsRead(Admin admin) {
        List<Notification> unreadNotifications = notificationRepository.findByReceiverAndIsReadFalse(admin);
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Mark all unread notifications as read for a user
     */
    @Transactional
    public void markAllUserNotificationsAsRead(User user) {
        List<UserNotification> unreadNotifications = userNotificationRepository.findByUserAndIsReadFalse(user);
        unreadNotifications.forEach(n -> n.setIsRead(true));
        userNotificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Get notifications for a specific complaint
     */
    public List<UserNotification> getNotificationsForComplaint(Long complaintId) {
        return userNotificationRepository.findByComplaintId(complaintId);
    }
}
