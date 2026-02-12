package com.complaint.redressal.model;

import javax.persistence.*;
import java.sql.Timestamp;
import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private ComplaintCategory category;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;

    private Double latitude;
    private Double longitude;
    private String address;
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "assigned_department_id")
    private Department assignedDepartment;

    @ManyToOne
    @JoinColumn(name = "municipality_id")
    private Municipality municipality;

    private String cityName;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Timestamp.from(Instant.now());
        updatedAt = Timestamp.from(Instant.now());
        if (status == null) {
            status = ComplaintStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Timestamp.from(Instant.now());
    }
}
