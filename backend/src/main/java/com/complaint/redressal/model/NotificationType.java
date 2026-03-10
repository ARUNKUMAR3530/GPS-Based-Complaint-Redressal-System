package com.complaint.redressal.model;

public enum NotificationType {
    COMPLAINT_CREATED, // System -> User: complaint submitted
    STATUS_CHANGED, // System -> User: admin updated status
    ASSIGNED, // System -> User: complaint assigned to department
    REMARK, // Super Admin -> Admin: remark on complaint
    ADMIN_REPLY, // Admin -> Super Admin: reply to remark
    NEW_COMPLAINT, // User -> Admin: New complaint received
    SYSTEM // Generic system notification
}
