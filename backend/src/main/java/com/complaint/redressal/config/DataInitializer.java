package com.complaint.redressal.config;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.Municipality;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.MunicipalityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    AdminRepository adminRepository;

    @Autowired
    MunicipalityRepository municipalityRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed Municipalities
        seedMunicipality("Chennai", "Chennai");
        seedMunicipality("Coimbatore", "Coimbatore");
        seedMunicipality("Salem", "Salem");

        // Seed Super Admin
        if (adminRepository.findByUsername("suberAD").isPresent()) {
            System.out.println("Admin 'suberAD' found. Resetting password and role...");
            Admin admin = adminRepository.findByUsername("suberAD").get();
            admin.setPassword(passwordEncoder.encode("suber24"));
            admin.setRole(Admin.ROLE_SUPER_ADMIN);
            adminRepository.save(admin);
            System.out.println("Admin role/password reset for: suberAD");
        } else {
            System.out.println("Admin 'suberAD' not found. Creating...");
            Admin admin = new Admin();
            admin.setUsername("suberAD");
            admin.setPassword(passwordEncoder.encode("suber24"));
            admin.setRole(Admin.ROLE_SUPER_ADMIN);
            adminRepository.save(admin);
            System.out.println("Default Super Admin created: username=suberAD");
        }

        // Seed Municipality Admins
        seedMunicipalityAdmin("admin_chn", "admin123", "Chennai");
        seedMunicipalityAdmin("admin_cbe", "admin123", "Coimbatore");
        seedMunicipalityAdmin("admin_slm", "admin123", "Salem");
    }

    private void seedMunicipality(String name, String district) {
        if (!municipalityRepository.findByName(name).isPresent()) {
            Municipality municipality = new Municipality(name, district);
            municipalityRepository.save(municipality);
            System.out.println("Seeded Municipality: " + name);
        }
    }

    private void seedMunicipalityAdmin(String username, String password, String municipalityName) {
        Municipality municipality = municipalityRepository.findByName(municipalityName)
                .orElseThrow(() -> new RuntimeException("Municipality not found: " + municipalityName));

        if (!adminRepository.findByUsername(username).isPresent()) {
            Admin admin = new Admin();
            admin.setUsername(username);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setMunicipality(municipality);
            admin.setRole(Admin.ROLE_MUNICIPALITY_ADMIN);
            adminRepository.save(admin);
            System.out.println("Seeded Admin: " + username + " for " + municipalityName);
        } else {
            System.out.println("Admin '" + username + "' found. Resetting password and role...");
            Admin admin = adminRepository.findByUsername(username).get();
            admin.setPassword(passwordEncoder.encode(password));
            admin.setMunicipality(municipality);
            admin.setRole(Admin.ROLE_MUNICIPALITY_ADMIN);
            adminRepository.save(admin);
            System.out.println("Admin role/password reset to: " + password);
        }
    }
}
