package com.complaint.redressal.controller;

import com.complaint.redressal.model.*;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.UserRepository;
import com.complaint.redressal.security.services.UserDetailsImpl;
import com.complaint.redressal.payload.MessageResponse;
import com.complaint.redressal.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ComplaintController {

        @Autowired
        private ComplaintService complaintService;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private AdminRepository adminRepository;

        @PostMapping("/complaints")
        @PreAuthorize("hasRole('USER')")
        public ResponseEntity<?> createComplaint(
                        @RequestParam("title") String title,
                        @RequestParam("description") String description,
                        @RequestParam("category") ComplaintCategory category,
                        @RequestParam("latitude") Double latitude,
                        @RequestParam("longitude") Double longitude,
                        @RequestParam(value = "address", required = false) String address,
                        @RequestParam(value = "image", required = false) MultipartFile image) {

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                User user = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Complaint complaint = complaintService.createComplaint(title, description, category, latitude,
                                longitude,
                                address, image, user);
                return ResponseEntity.ok(complaint);
        }

        @GetMapping("/complaints/my")
        @PreAuthorize("hasRole('USER')")
        public List<Complaint> getMyComplaints() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                User user = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return complaintService.getComplaintsByUser(user);
        }

        @DeleteMapping("/complaints/{id}")
        @PreAuthorize("hasRole('USER')")
        public ResponseEntity<?> deleteComplaint(@PathVariable Long id) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal(); // Get ID from token
                User user = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                try {
                        complaintService.deleteComplaint(id, user);
                        return ResponseEntity.ok(new MessageResponse("Complaint deleted successfully"));
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
                }
        }

        @GetMapping("/complaints/{id}")
        @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
        public ResponseEntity<?> getComplaintById(@PathVariable Long id) {
                return complaintService.getComplaintById(id)
                                .map(complaint -> {
                                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                                        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                                        if (userDetails.getAuthorities().stream()
                                                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                                                // Check if District Admin
                                                Admin admin = adminRepository.findById(userDetails.getId())
                                                                .orElse(null);
                                                if (admin != null) {
                                                        boolean isSuperAdmin = (admin.getDepartment() == null
                                                                        && admin.getMunicipality() == null);
                                                        if (!isSuperAdmin && complaint.getUser() != null) {
                                                                // Mask
                                                                User u = complaint.getUser();
                                                                u.setMobile("******");
                                                                u.setEmail("******");
                                                        }
                                                }
                                        }
                                        return ResponseEntity.ok(complaint);
                                })
                                .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/admin/complaints/{id}/complainant-details")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> getComplainantDetails(@PathVariable Long id) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

                Admin admin = adminRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                boolean isSuperAdmin = (admin.getDepartment() == null && admin.getMunicipality() == null);
                if (!isSuperAdmin) {
                        return ResponseEntity.status(403)
                                        .body(new MessageResponse("Access Denied: Restricted to Super Admin"));
                }

                return complaintService.getComplaintById(id)
                                .map(complaint -> ResponseEntity.ok(complaint.getUser()))
                                .orElse(ResponseEntity.notFound().build());
        }

        // --- Admin Endpoints ---

        @GetMapping("/admin/complaints")
        @PreAuthorize("hasRole('ADMIN')")
        public List<Complaint> getAllComplaints() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                Admin admin = adminRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                List<Complaint> complaints = complaintService.getComplaintsForAdmin(admin);

                boolean isSuperAdmin = (admin.getDepartment() == null && admin.getMunicipality() == null);
                if (!isSuperAdmin) {
                        complaints.forEach(c -> {
                                if (c.getUser() != null) {
                                        c.getUser().setMobile("******");
                                        c.getUser().setEmail("******");
                                }
                        });
                }
                return complaints;
        }

        @PutMapping("/admin/complaints/{id}/status")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> updateStatus(
                        @PathVariable Long id,
                        @RequestParam("status") ComplaintStatus status,
                        @RequestParam("remarks") String remarks) {

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                Admin admin = adminRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                Complaint complaint = complaintService.updateStatus(id, status, remarks, admin);
                return ResponseEntity.ok(complaint);
        }
}
