package com.complaint.redressal.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "admins", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username")
})
@Data
@NoArgsConstructor
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @Column(columnDefinition = "boolean default false")
    private boolean isPasswordChanged = false;

    @Column(name = "force_password_change", columnDefinition = "boolean default false")
    private boolean forcePasswordChange = false;

    @Column(columnDefinition = "varchar(255) default 'ADMIN'")
    private String role = "ADMIN";

    @Column(columnDefinition = "varchar(255) default 'ACTIVE'")
    private String status = "ACTIVE";

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department; // Null for Super Admin

    @ManyToOne
    @JoinColumn(name = "municipality_id")
    private Municipality municipality; // Null for Super Admin

    public static final String ROLE_SUPER_ADMIN = "ROLE_SUPER_ADMIN";
    public static final String ROLE_MUNICIPALITY_ADMIN = "ROLE_MUNICIPALITY_ADMIN";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
}
