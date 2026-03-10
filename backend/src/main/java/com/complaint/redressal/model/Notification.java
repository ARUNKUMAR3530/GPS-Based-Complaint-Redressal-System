package com.complaint.redressal.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.sql.Timestamp;
import java.time.Instant;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private Admin sender; // The sender admin (e.g., SUPER_ADMIN)

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private Admin receiver; // The recipient admin

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type; // e.g., REMARK, ADMIN_REPLY

    @JsonProperty("isRead")
    private Boolean isRead = false;

    private Timestamp createdAt;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint; // Link to associated complaint

    @PrePersist
    protected void onCreate() {
        createdAt = Timestamp.from(Instant.now());
    }
}
