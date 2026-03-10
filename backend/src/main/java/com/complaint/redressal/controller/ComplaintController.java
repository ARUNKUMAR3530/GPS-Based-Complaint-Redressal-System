package com.complaint.redressal.controller;

import com.complaint.redressal.model.*;
import com.complaint.redressal.payload.UpdateStatusRequest;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.UserRepository;
import com.complaint.redressal.security.services.UserDetailsImpl;
import com.complaint.redressal.payload.MessageResponse;
import com.complaint.redressal.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;
import com.complaint.redressal.payload.ComplaintDTO;

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
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @RequestParam("title") String title,
                        @RequestParam("description") String description,
                        @RequestParam("category") ComplaintCategory category,
                        @RequestParam("latitude") Double latitude,
                        @RequestParam("longitude") Double longitude,
                        @RequestParam(value = "address", required = false) String address,
                        @RequestParam(value = "image", required = false) MultipartFile image) {
                User user = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Complaint complaint = complaintService.createComplaint(title, description, category, latitude,
                                longitude,
                                address, image, user);
                return ResponseEntity.ok(complaint);
        }

        @GetMapping("/complaints/my")
        @PreAuthorize("hasRole('USER')")
        public List<Complaint> getMyComplaints(@AuthenticationPrincipal UserDetailsImpl userDetails) {
                User user = userRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return complaintService.getComplaintsByUser(user);
        }

        @DeleteMapping("/complaints/{id}")
        @PreAuthorize("hasRole('USER')")
        public ResponseEntity<?> deleteComplaint(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
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
        public ResponseEntity<?> getComplaintById(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
                return complaintService.getComplaintById(id)
                                .map(complaint -> ResponseEntity.ok(
                                                ComplaintDTO.fromEntity(complaint, shouldMaskUserDetails(userDetails))))
                                .orElse(ResponseEntity.notFound().build());
        }

        @GetMapping("/admin/complaints/{id}/complainant-details")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> getComplainantDetails(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
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
        public List<ComplaintDTO> getAllComplaints(@AuthenticationPrincipal UserDetailsImpl userDetails) {
                Admin admin = adminRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                List<Complaint> complaints = complaintService.getComplaintsForAdmin(admin);

                return complaints.stream()
                                .map(c -> ComplaintDTO.fromEntity(c, shouldMaskUserDetails(userDetails)))
                                .collect(Collectors.toList());
        }

        @PutMapping("/admin/complaints/{id}/status")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> updateStatus(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id,
                        @RequestBody UpdateStatusRequest request) {
                Admin admin = adminRepository.findById(userDetails.getId())
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                Complaint complaint = complaintService.updateStatus(id, request.getStatus(), request.getRemarks(),
                                admin);

                return ResponseEntity.ok(ComplaintDTO.fromEntity(complaint, shouldMaskUserDetails(userDetails)));
        }

        private boolean shouldMaskUserDetails(UserDetailsImpl userDetails) {
                if (userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                        return false; // Not an admin, no masking logic applies
                }
                // Mask details if the user is an admin but NOT a super-admin
                return adminRepository.findById(userDetails.getId())
                                .map(admin -> !(admin.getDepartment() == null && admin.getMunicipality() == null))
                                .orElse(true); // Should not happen, but if admin not found, mask by default for safety
        }
}
