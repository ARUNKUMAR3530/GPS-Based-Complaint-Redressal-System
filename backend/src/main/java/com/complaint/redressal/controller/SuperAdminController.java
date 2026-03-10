package com.complaint.redressal.controller;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.payload.AdminWorkStatus;
import com.complaint.redressal.model.Department;
import com.complaint.redressal.model.Municipality;
import com.complaint.redressal.payload.AdminSignupRequest;
import com.complaint.redressal.payload.MessageResponse;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.ComplaintRepository;
import com.complaint.redressal.repository.DepartmentRepository;
import com.complaint.redressal.repository.MunicipalityRepository;

import com.complaint.redressal.service.NotificationService;
import com.complaint.redressal.model.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import com.complaint.redressal.security.services.UserDetailsImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminController {

    @Autowired
    AdminRepository adminRepository;

    @Autowired
    DepartmentRepository departmentRepository;

    @Autowired
    MunicipalityRepository municipalityRepository;

    @Autowired
    ComplaintRepository complaintRepository;

    @Autowired
    NotificationService notificationService;

    @Autowired
    PasswordEncoder encoder;

    @PreAuthorize("hasRole('SUPER_ADMIN')")
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

        if (signUpRequest.getRole() != null && !signUpRequest.getRole().isEmpty()) {
            admin.setRole(signUpRequest.getRole());
        } else {
            admin.setRole(Admin.ROLE_ADMIN); // Default fallback
        }

        if (signUpRequest.getDepartmentId() != null) {
            Optional<Department> department = departmentRepository.findById(signUpRequest.getDepartmentId());
            department.ifPresent(admin::setDepartment);
        }

        if (signUpRequest.getMunicipalityId() != null) {
            Optional<Municipality> municipality = municipalityRepository.findById(signUpRequest.getMunicipalityId());
            municipality.ifPresent(admin::setMunicipality);
        } else if (signUpRequest.getMunicipalityName() != null && !signUpRequest.getMunicipalityName().isEmpty()) {
            Optional<Municipality> existingMunicipality = municipalityRepository
                    .findByName(signUpRequest.getMunicipalityName());
            if (existingMunicipality.isPresent()) {
                admin.setMunicipality(existingMunicipality.get());
            } else {
                Municipality newMunicipality = new Municipality(signUpRequest.getMunicipalityName(),
                        signUpRequest.getMunicipalityName()); // Default district to name
                municipalityRepository.save(newMunicipality);
                admin.setMunicipality(newMunicipality);
            }
        }

        adminRepository.save(admin);

        return ResponseEntity.ok(new MessageResponse("Admin registered successfully!"));
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/admins")
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
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

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id) {
        return adminRepository.findById(id)
                .map(admin -> {
                    adminRepository.delete(admin);
                    return ResponseEntity.ok(new MessageResponse("Admin deleted successfully!"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
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

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/admins/{id}/remark")
    public ResponseEntity<?> sendRemark(@PathVariable Long id,
            @RequestParam(required = false) Long complaintId,
            @RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Message cannot be empty!"));
        }

        // Get current admin from security context (principal)
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Admin sender = adminRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Error: Sender admin not found with ID: " + userPrincipal.getId()));

        // Get receiver admin
        Admin receiver = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Admin not found."));

        // Get complaint if complaintId provided
        com.complaint.redressal.model.Complaint complaint = null;
        if (complaintId != null) {
            complaint = complaintRepository.findById(complaintId).orElse(null);
        }

        // Create and broadcast notification using service
        notificationService.createAdminNotification(sender, receiver, message, NotificationType.REMARK, complaint);

        return ResponseEntity.ok(new MessageResponse("Remark sent successfully!"));
    }

    /**
     * Admin replies to a remark from Super Admin
     */
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MUNICIPALITY_ADMIN', 'ADMIN')")
    @PostMapping("/admins/reply")
    public ResponseEntity<?> replyToRemarkGeneric(@RequestParam(required = false) Long complaintId,
            @RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Message cannot be empty!"));
        }

        // Get current admin (replier) from principal ID
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Admin sender = adminRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Error: Admin not found with ID: " + userPrincipal.getId()));

        // Find the first Super Admin - checking both common role naming formats
        List<Admin> superAdmins = adminRepository.findAll().stream()
                .filter(admin -> "ROLE_SUPER_ADMIN".equals(admin.getRole()) || "SUPER_ADMIN".equals(admin.getRole()))
                .toList();
        if (superAdmins.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: No Super Admin found in the system."));
        }
        Admin superAdmin = superAdmins.get(0);

        // Get complaint if provided
        com.complaint.redressal.model.Complaint complaint = null;
        if (complaintId != null) {
            complaint = complaintRepository.findById(complaintId).orElse(null);
        }

        // Send reply
        notificationService.createAdminNotification(sender, superAdmin, message, NotificationType.ADMIN_REPLY, complaint);

        return ResponseEntity.ok(new MessageResponse("Reply sent successfully!"));
    }

    @Deprecated
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MUNICIPALITY_ADMIN', 'ADMIN')")
    @PostMapping("/complaints/{complaintId}/reply")
    public ResponseEntity<?> replyToRemark(@PathVariable Long complaintId,
            @RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Message cannot be empty!"));
        }

        // Get current admin (replier)
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Admin sender = adminRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("Error: Admin not found with ID: " + userPrincipal.getId()));

        // Find Super Admin - checking both prefixed and non-prefixed role strings
        List<Admin> superAdmins = adminRepository.findAll().stream()
                .filter(admin -> "ROLE_SUPER_ADMIN".equals(admin.getRole()) || "SUPER_ADMIN".equals(admin.getRole()))
                .toList();

        if (superAdmins.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: No Super Admin found in the system."));
        }

        // Get complaint
        com.complaint.redressal.model.Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Error: Complaint not found."));

        // Send reply to first Super Admin found
        Admin superAdmin = superAdmins.get(0);
        notificationService.createAdminNotification(sender, superAdmin, message, NotificationType.ADMIN_REPLY,
                complaint);

        return ResponseEntity.ok(new MessageResponse("Reply sent successfully!"));
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
