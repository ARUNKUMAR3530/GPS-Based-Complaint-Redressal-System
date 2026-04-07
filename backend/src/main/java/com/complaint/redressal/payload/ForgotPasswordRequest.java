package com.complaint.redressal.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank
    private String identifier; // username or mobile number
}
