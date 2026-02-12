package com.complaint.redressal.model;

import javax.persistence.*;
import java.sql.Timestamp;
import java.time.Instant;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "status_history")
@Data
@NoArgsConstructor
public class StatusHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "updated_by_admin_id")
    private Admin updatedBy;

    private Timestamp timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = Timestamp.from(Instant.now());
    }
}
