package com.complaint.redressal.payload;

import com.complaint.redressal.model.*;
import lombok.Data;
import java.sql.Timestamp;

@Data
public class ComplaintDTO {
    private Long id;
    private String title;
    private String description;
    private ComplaintCategory category;
    private ComplaintStatus status;
    private Double latitude;
    private Double longitude;
    private String address;
    private String imageUrl;
    private UserDTO user;
    private Department department;
    private Municipality municipality;
    private String cityName;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    @Data
    public static class UserDTO {
        private Long id;
        private String username;
        private String fullName;
        private String mobile;
        private String email;
    }

    public static ComplaintDTO fromEntity(Complaint c, boolean maskUser) {
        ComplaintDTO dto = new ComplaintDTO();
        dto.setId(c.getId());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setCategory(c.getCategory());
        dto.setStatus(c.getStatus());
        dto.setLatitude(c.getLatitude());
        dto.setLongitude(c.getLongitude());
        dto.setAddress(c.getAddress());
        dto.setImageUrl(c.getImageUrl());
        dto.setDepartment(c.getAssignedDepartment());
        dto.setMunicipality(c.getMunicipality());
        dto.setCityName(c.getCityName());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());

        if (c.getUser() != null) {
            User u = c.getUser();
            UserDTO userDTO = new UserDTO();
            userDTO.setId(u.getId());
            userDTO.setFullName(u.getFullName());
            userDTO.setUsername(u.getUsername());
            if (maskUser) {
                userDTO.setMobile("******");
                userDTO.setEmail("******");
            } else {
                userDTO.setMobile(u.getMobile());
                userDTO.setEmail(u.getEmail());
            }
            dto.setUser(userDTO);
        }
        return dto;
    }
}
