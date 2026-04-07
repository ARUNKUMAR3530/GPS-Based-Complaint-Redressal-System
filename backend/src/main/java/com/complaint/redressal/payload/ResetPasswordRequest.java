package com.complaint.redressal.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank
    private String identifier;

    @NotBlank
    private String otpCode;

    @NotBlank
    private String newPassword;
}
