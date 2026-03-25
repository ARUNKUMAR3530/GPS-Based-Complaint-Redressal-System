package com.complaint.redressal.controller;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.Notification;
import com.complaint.redressal.model.User;
import com.complaint.redressal.model.UserNotification;
import com.complaint.redressal.payload.MessageResponse;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.NotificationRepository;
import com.complaint.redressal.repository.UserRepository;
import com.complaint.redressal.repository.UserNotificationRepository;
import com.complaint.redressal.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.complaint.redressal.security.services.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    AdminRepository adminRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    UserNotificationRepository userNotificationRepository;

    @Autowired
    NotificationService notificationService;

    @GetMapping
    public ResponseEntity<?> getNotifications() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Admin admin = adminRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Error: Admin not found with ID: " + userPrincipal.getId()));

        List<Notification> notifications = notificationRepository.findByReceiverOrderByCreatedAtDesc(admin);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Admin admin = adminRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Error: Admin not found with ID: " + userPrincipal.getId()));

        long count = notificationRepository.countByReceiverAndIsReadFalse(admin);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id)
                .map(notification -> {
                    notification.setIsRead(true);
                    notificationRepository.save(notification);
                    return ResponseEntity.ok(new MessageResponse("Marked as read"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ============ USER NOTIFICATIONS ============

    @GetMapping("/user")
    public ResponseEntity<?> getUserNotifications() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found with ID: " + userPrincipal.getId()));

        List<UserNotification> notifications = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/unread-count")
    public ResponseEntity<?> getUserUnreadCount() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found with ID: " + userPrincipal.getId()));

        Long count = notificationService.getUnreadUserCount(user);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/user/{id}/read")
    public ResponseEntity<?> markUserNotificationAsRead(@PathVariable Long id) {
        return userNotificationRepository.findById(id)
                .map(notification -> {
                    notification.setIsRead(true);
                    userNotificationRepository.save(notification);
                    return ResponseEntity.ok(new MessageResponse("User notification marked as read"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
