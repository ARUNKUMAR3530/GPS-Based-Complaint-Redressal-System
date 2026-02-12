package com.complaint.redressal.payload;

import lombok.Data;

import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email; // Null for admin ideally, or simple string
    private List<String> roles;
    private Long departmentId; // For Admin
    private boolean isPasswordChanged = true;

    public JwtResponse(String accessToken, Long id, String username, String email, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }

    public JwtResponse(String accessToken, Long id, String username, List<String> roles, Long departmentId,
            boolean isPasswordChanged) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.roles = roles;
        this.departmentId = departmentId;
        this.isPasswordChanged = isPasswordChanged;
    }
}
