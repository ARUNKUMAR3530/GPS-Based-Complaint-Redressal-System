package com.complaint.redressal.security.services;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;

    private String username;

    private String email;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    private Long departmentId; // For Admin

    private boolean isPasswordChanged = true; // Default true for users

    public UserDetailsImpl(Long id, String username, String email, String password,
            Collection<? extends GrantedAuthority> authorities, Long departmentId, boolean isPasswordChanged) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.departmentId = departmentId;
        this.isPasswordChanged = isPasswordChanged;
    }

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                null,
                true);
    }

    public static UserDetailsImpl build(Admin admin) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        // Add more specific roles if needed based on department or existing logic

        Long deptId = (admin.getDepartment() != null) ? admin.getDepartment().getId() : null;

        return new UserDetailsImpl(
                admin.getId(),
                admin.getUsername(),
                null, // Admin has no email in this schema
                admin.getPassword(),
                authorities,
                deptId,
                admin.isPasswordChanged());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public boolean isPasswordChanged() {
        return isPasswordChanged;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
