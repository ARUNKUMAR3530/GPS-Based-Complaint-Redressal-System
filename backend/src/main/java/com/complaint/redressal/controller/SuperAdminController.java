package com.complaint.redressal.controller;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.payload.AdminWorkStatus;
import com.complaint.redressal.model.ComplaintStatus;
import com.complaint.redressal.model.Department;
import com.complaint.redressal.model.Municipality;
import com.complaint.redressal.payload.AdminSignupRequest;
import com.complaint.redressal.payload.MessageResponse;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.DepartmentRepository;
import com.complaint.redressal.repository.MunicipalityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/super-admin")
@PreAuthorize("hasRole('ADMIN')")
public class SuperAdminController {

    @Autowired
    AdminRepository adminRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    MunicipalityRepository municipalityRepository;

    @Autowired
    PasswordEncoder encoder;

    @PostMapping("/admins")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody AdminSignupRequest signUpRequest) {
        if (adminRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        Admin admin = new Admin();
        admin.setUsername(signUpRequest.getUsername());
        admin.setPassword(encoder.encode(signUpRequest.getPassword()));

        if (signUpRequest.getDepartmentId() != null) {
            Optional<Department> department = departmentRepository.findById(signUpRequest.getDepartmentId());
            department.ifPresent(admin::setDepartment);
        }

        if (signUpRequest.getMunicipalityId() != null) {
            Optional<Municipality> municipality = municipalityRepository.findById(signUpRequest.getMunicipalityId());
            municipality.ifPresent(admin::setMunicipality);
        }

        adminRepository.save(admin);

        return ResponseEntity.ok(new MessageResponse("Admin registered successfully!"));
    }

    @GetMapping("/admins")
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @Valid @RequestBody AdminSignupRequest updateRequest) {
        return adminRepository.findById(id)
                .map(admin -> {
                    admin.setUsername(updateRequest.getUsername());
                    if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
                        admin.setPassword(encoder.encode(updateRequest.getPassword()));
                    }

                    if (updateRequest.getDepartmentId() != null) {
                        departmentRepository.findById(updateRequest.getDepartmentId()).ifPresent(admin::setDepartment);
                    } else {
                        admin.setDepartment(null);
                    }

                    if (updateRequest.getMunicipalityId() != null) {
                        municipalityRepository.findById(updateRequest.getMunicipalityId())
                                .ifPresent(admin::setMunicipality);
                    } else {
                        admin.setMunicipality(null);
                    }

                    adminRepository.save(admin);
                    return ResponseEntity.ok(new MessageResponse("Admin updated successfully!"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        return adminRepository.findById(id)
                .map(admin -> {
                    adminRepository.delete(admin);
                    return ResponseEntity.ok(new MessageResponse("Admin deleted successfully!"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Autowired
    com.complaint.redressal.repository.ComplaintRepository complaintRepository;

    @GetMapping("/admins/status")
    public List<AdminWorkStatus> getAdminWorkStatus() {
        return adminRepository.findAll().stream().map(admin -> {
            long total = 0;
            long pending = 0;
            long resolved = 0;

            if (admin.getDepartment() != null) {
                total = complaintRepository.countByAssignedDepartment(admin.getDepartment());
                pending = complaintRepository.countByAssignedDepartmentAndStatus(admin.getDepartment(),
                        com.complaint.redressal.model.ComplaintStatus.PENDING);
                resolved = complaintRepository.countByAssignedDepartmentAndStatus(admin.getDepartment(),
                        com.complaint.redressal.model.ComplaintStatus.COMPLETED);
            } else if (admin.getMunicipality() != null) {
                total = complaintRepository.countByMunicipality(admin.getMunicipality());
                pending = complaintRepository.countByMunicipalityAndStatus(admin.getMunicipality(),
                        com.complaint.redressal.model.ComplaintStatus.PENDING);
                resolved = complaintRepository.countByMunicipalityAndStatus(admin.getMunicipality(),
                        com.complaint.redressal.model.ComplaintStatus.COMPLETED);
            }

            // If Super Admin (no dept/muni), stats are global or specific logic. For now, 0
            // or skip.
            // Assuming this view is for District Admins mainly.

            String deptName = (admin.getDepartment() != null) ? admin.getDepartment().getName() : null;
            String muniName = (admin.getMunicipality() != null) ? admin.getMunicipality().getName() : null;

            return new AdminWorkStatus(
                    admin.getId(),
                    admin.getUsername(),
                    deptName,
                    muniName,
                    total,
                    pending,
                    resolved);
        }).collect(java.util.stream.Collectors.toList());
    }

    @Autowired
    com.complaint.redressal.repository.NotificationRepository notificationRepository;

    @PostMapping("/admins/{id}/remark")
    public ResponseEntity<?> sendRemark(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Message cannot be empty!"));
        }

        return adminRepository.findById(id)
                .map(admin -> {
                    com.complaint.redressal.model.Notification notification = new com.complaint.redressal.model.Notification();
                    notification.setAdmin(admin);
                    notification.setMessage(message);
                    notificationRepository.save(notification);
                    return ResponseEntity.ok(new MessageResponse("Remark sent successfully!"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/municipalities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllMunicipalities() {
        return ResponseEntity.ok(municipalityRepository.findAll());
    }

    @GetMapping("/departments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }
}
