package com.complaint.redressal.repository;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByAdminOrderByCreatedAtDesc(Admin admin);

    List<Notification> findByAdminAndIsReadFalse(Admin admin);
}
