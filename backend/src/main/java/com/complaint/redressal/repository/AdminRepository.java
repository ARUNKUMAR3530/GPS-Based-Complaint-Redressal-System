package com.complaint.redressal.repository;

import com.complaint.redressal.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUsername(String username);

    Boolean existsByUsername(String username);
    Optional<Admin> findByEmail(String email);
    Optional<Admin> findByMobile(String mobile);

    java.util.List<Admin> findByMunicipality(com.complaint.redressal.model.Municipality municipality);

    java.util.List<Admin> findByDepartment(com.complaint.redressal.model.Department department);

    java.util.List<Admin> findByRole(String role);
}
