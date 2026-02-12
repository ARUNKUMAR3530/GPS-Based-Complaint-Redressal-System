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
    @JoinColumn(name = "admin_id")
    private Admin admin; // The recipient admin

    private String message;

    private boolean isRead = false;

    private Timestamp createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Timestamp.from(Instant.now());
    }
}
