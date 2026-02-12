package com.complaint.redressal.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminWorkStatus {
    private Long adminId;
    private String username;
    private String departmentName;
    private String municipalityName;
    private long totalComplaints;
    private long pendingComplaints;
    private long resolvedComplaints;
}
