package com.complaint.redressal.service;

import com.complaint.redressal.model.*;
import com.complaint.redressal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {
    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    @Autowired
    private com.cloudinary.Cloudinary cloudinary;

    @Autowired
    private MunicipalityRepository municipalityRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AdminRepository adminRepository;

    @Transactional
    public Complaint createComplaint(String title, String description, ComplaintCategory category,
            Double lat, Double lon, String address, MultipartFile file, User user) {
        Complaint complaint = new Complaint();
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setCategory(category);
        complaint.setLatitude(lat);
        complaint.setLongitude(lon);
        complaint.setAddress(address);
        complaint.setUser(user);

        if (file != null && !file.isEmpty()) {
            try {
                String contentType = file.getContentType();
                java.util.Map<?, ?> uploadOptions = com.cloudinary.utils.ObjectUtils.emptyMap();

                if (contentType != null && (
                        contentType.equals("application/pdf") ||
                        contentType.equals("application/msword") ||
                        contentType.contains("wordprocessingml"))) {
                    uploadOptions = com.cloudinary.utils.ObjectUtils.asMap("resource_type", "raw");
                }
                
                java.util.Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
                String imageUrl = uploadResult.get("url").toString();
                complaint.setImageUrl(imageUrl);
            } catch (java.io.IOException e) {
                throw new RuntimeException("Image upload to Cloudinary failed", e);
            }
        }

        // Auto-assign department
        String deptName = mapCategoryToDepartment(category);
        Optional<Department> dept = departmentRepository.findByName(deptName);
        if (dept.isPresent()) {
            complaint.setAssignedDepartment(dept.get());
        } else {
            // Create department if not exists (Seeding logic essentially)
            Department newDept = new Department(deptName);
            departmentRepository.save(newDept);
            complaint.setAssignedDepartment(newDept);
        }

        // Auto-assign Municipality based on Location
        assignMunicipality(complaint, lat, lon);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Notify Admins (Municipality Admin and Super Admin)
        String message = "New Complaint Received: " + savedComplaint.getTitle();

        // Find Admins of this municipality
        if (savedComplaint.getMunicipality() != null) {
            List<Admin> municipalityAdmins = adminRepository.findByMunicipality(savedComplaint.getMunicipality());
            for (Admin admin : municipalityAdmins) {
                notificationService.createAdminNotification(null, admin, message, NotificationType.NEW_COMPLAINT,
                        savedComplaint);
            }
        }

        // Also notify Super Admins
        List<Admin> superAdmins = adminRepository.findByRole("ROLE_SUPER_ADMIN");
        for (Admin admin : superAdmins) {
            notificationService.createAdminNotification(null, admin, message, NotificationType.NEW_COMPLAINT,
                    savedComplaint);
        }

        return savedComplaint;
    }

    private void assignMunicipality(Complaint complaint, Double lat, Double lon) {
        // Simplified Logic: Distance-based routing
        // In a real app, use Google Maps Geocoding API or Nominatim here

        // Coordinates for centers
        // Chennai: 13.0827, 80.2707
        // Coimbatore: 11.0168, 76.9558
        // Salem: 11.6643, 78.1460

        if (lat != null && lon != null) {
            double distChennai = calculateDistance(lat, lon, 13.0827, 80.2707);
            double distCoimbatore = calculateDistance(lat, lon, 11.0168, 76.9558);
            double distSalem = calculateDistance(lat, lon, 11.6643, 78.1460);

            String city = "Chennai"; // Default
            double MAX_RADIUS_KM = 60.0;
            
            double minDist = Math.min(distChennai, Math.min(distCoimbatore, distSalem));
            
            if (minDist > MAX_RADIUS_KM) {
                city = "Chennai";
            } else if (distCoimbatore == minDist) {
                city = "Coimbatore";
            } else if (distSalem == minDist) {
                city = "Salem";
            }

            complaint.setCityName(city);
            municipalityRepository.findByName(city).ifPresent(complaint::setMunicipality);
        } else {
            complaint.setCityName("Chennai"); // Default fallback
            municipalityRepository.findByName("Chennai").ifPresent(complaint::setMunicipality);
        }
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double theta = lon1 - lon2;
        double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2))
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
        dist = Math.acos(Math.max(-1.0, Math.min(1.0, dist)));
        dist = Math.toDegrees(dist);
        dist = dist * 60 * 1.1515;
        return (dist * 1.609344); // Kilometers
    }

    private String mapCategoryToDepartment(ComplaintCategory category) {
        switch (category) {
            case ROAD:
                return "Roads";
            case GARBAGE:
                return "Sanitation";
            case WATER:
                return "Water";
            case ELECTRICITY:
                return "Electricity";
            default:
                return "General";
        }
    }

    public List<Complaint> getComplaintsByUser(User user) {
        return complaintRepository.findByUser(user);
    }

    // Deprecated for Admin use, use getComplaintsForAdmin instead
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getComplaintsForAdmin(Admin admin) {
        if (admin.getMunicipality() == null) {
            // Super Admin sees all
            return complaintRepository.findAll();
        } else {
            // Scoped Admin sees only their municipality
            return complaintRepository.findByMunicipality(admin.getMunicipality());
        }
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    @Transactional
    public Complaint updateStatus(Long id, ComplaintStatus status, String remarks, Admin admin) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(status);
        Complaint updated = complaintRepository.save(complaint);

        // Log history
        StatusHistory history = new StatusHistory();
        history.setComplaint(updated);
        history.setStatus(status);
        history.setRemarks(remarks);
        history.setUpdatedBy(admin);
        statusHistoryRepository.save(history);

        // Trigger notification to user (citizen) about status change
        if (updated.getUser() != null) {
            String message = String.format(
                    "Your complaint status has been updated to %s. %s",
                    status.toString(),
                    remarks != null && !remarks.isEmpty() ? "Remarks: " + remarks : "");
            notificationService.createUserNotification(
                    updated.getUser(),
                    updated,
                    NotificationType.STATUS_CHANGED,
                    message.trim());
        }

        return updated;
    }

    @Transactional
    public void deleteComplaint(Long id, User user) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (!complaint.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this complaint");
        }

        long diff = java.time.Instant.now().toEpochMilli() - complaint.getCreatedAt().getTime();
        long sevenMinutes = 7 * 60 * 1000;

        if (diff > sevenMinutes) {
            throw new RuntimeException(
                    "Deletion time expired: Complaints can only be deleted within 7 minutes of creation.");
        }

        complaintRepository.delete(complaint);
    }
}
