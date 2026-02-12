package com.complaint.redressal.payload;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
}
