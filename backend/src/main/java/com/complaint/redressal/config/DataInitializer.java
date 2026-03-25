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

        // Seed Super Admin — username: suberAD, password: admin123
        seedSuperAdmin("suberAD", "admin123");

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

    private void seedSuperAdmin(String username, String password) {
        if (adminRepository.findByUsername(username).isPresent()) {
            System.out.println("Super Admin '" + username + "' found. Resetting password...");
            Admin admin = adminRepository.findByUsername(username).get();
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(Admin.ROLE_SUPER_ADMIN);
            admin.setPasswordChanged(true);
            adminRepository.save(admin);
            System.out.println("Super Admin reset done. username=" + username + " password=" + password);
        } else {
            System.out.println("Creating Super Admin: " + username);
            Admin admin = new Admin();
            admin.setUsername(username);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(Admin.ROLE_SUPER_ADMIN);
            admin.setPasswordChanged(true);
            adminRepository.save(admin);
            System.out.println("Super Admin created: username=" + username + " password=" + password);
        }
    }

    private void seedMunicipalityAdmin(String username, String password, String municipalityName) {
        Municipality municipality = municipalityRepository.findByName(municipalityName)
                .orElseThrow(() -> new RuntimeException("Municipality not found: " + municipalityName));

        if (adminRepository.findByUsername(username).isPresent()) {
            System.out.println("Admin '" + username + "' found. Resetting...");
            Admin admin = adminRepository.findByUsername(username).get();
            admin.setPassword(passwordEncoder.encode(password));
            admin.setMunicipality(municipality);
            admin.setRole(Admin.ROLE_MUNICIPALITY_ADMIN);
            admin.setPasswordChanged(true);
            adminRepository.save(admin);
            System.out.println("Admin reset: " + username + " / " + password);
        } else {
            System.out.println("Creating Admin: " + username + " for " + municipalityName);
            Admin admin = new Admin();
            admin.setUsername(username);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setMunicipality(municipality);
            admin.setRole(Admin.ROLE_MUNICIPALITY_ADMIN);
            admin.setPasswordChanged(true);
            adminRepository.save(admin);
            System.out.println("Admin created: " + username + " / " + password);
        }
    }
}
