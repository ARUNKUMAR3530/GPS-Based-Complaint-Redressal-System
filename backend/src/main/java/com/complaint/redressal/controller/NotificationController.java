package com.complaint.redressal.controller;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.Notification;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.NotificationRepository;
import com.complaint.redressal.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationController {

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    AdminRepository adminRepository;

    @GetMapping
    public List<Notification> getMyNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Admin admin = adminRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return notificationRepository.findByAdminOrderByCreatedAtDesc(admin);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        // Optional: Mark as read
        notificationRepository.findById(id).ifPresent(notification -> {
            // Check ownership if needed
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
}
