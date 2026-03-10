package com.complaint.redressal.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.sql.Timestamp;
import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_notifications")
@Data
@NoArgsConstructor
public class UserNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // Recipient user (citizen)

    @ManyToOne
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;  // Associated complaint

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;  // COMPLAINT_CREATED, STATUS_CHANGED, ASSIGNED

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @JsonProperty("isRead")
    @Column(nullable = false)
    private Boolean isRead = false;

    @Column(nullable = false)
    private Timestamp createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Timestamp.from(Instant.now());
    }
}
