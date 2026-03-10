package com.complaint.redressal.repository;

import com.complaint.redressal.model.User;
import com.complaint.redressal.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserOrderByCreatedAtDesc(User user);

    List<UserNotification> findByUserAndIsReadFalse(User user);

    Long countByUserAndIsReadFalse(User user);

    List<UserNotification> findByComplaintId(Long complaintId);
}
