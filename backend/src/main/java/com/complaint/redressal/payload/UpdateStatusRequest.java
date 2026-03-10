package com.complaint.redressal.payload;

import com.complaint.redressal.model.ComplaintStatus;

public class UpdateStatusRequest {
    private ComplaintStatus status;
    private String remarks;

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
