package com.complaint.redressal.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
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

    @Column(nullable = false)
    private String type; // e.g., "REMARK", "SYSTEM"

    private boolean isRead = false;

    private Timestamp createdAt;

    // Optional: link to a complaint if relevant
    private Long complaintId;

    @PrePersist
    protected void onCreate() {
        createdAt = Timestamp.from(Instant.now());
    }
}
