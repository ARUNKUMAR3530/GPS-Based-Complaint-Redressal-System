package com.complaint.redressal.controller;

import com.complaint.redressal.model.User;
import com.complaint.redressal.payload.*;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.DepartmentRepository;
import com.complaint.redressal.repository.UserRepository;
import com.complaint.redressal.security.jwt.JwtUtils;
import com.complaint.redressal.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        com.complaint.redressal.repository.MunicipalityRepository municipalityRepository;

        @Autowired
        UserRepository userRepository;

        @Autowired
        AdminRepository adminRepository;

        @Autowired
        DepartmentRepository departmentRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @PostMapping("/login")
        public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                List<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toList());

                if (!roles.contains("ROLE_USER")) {
                        return ResponseEntity.badRequest().body(new MessageResponse(
                                        "Error: Unauthorized. Please use the Official Login page."));
                }

                return ResponseEntity.ok(new JwtResponse(jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getEmail(),
                                roles));
        }

        @PostMapping("/admin/login")
        public ResponseEntity<?> authenticateAdmin(@Valid @RequestBody LoginRequest loginRequest) {
                // Since we use a unified UserDetailsService, we can use the same authentication
                // manager.
                // However, we must verify that the authenticated user is indeed an ADMIN.
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                List<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toList());

                if (!roles.contains("ROLE_ADMIN")) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Error: Not authorized as Admin"));
                }

                String jwt = jwtUtils.generateJwtToken(authentication);

                return ResponseEntity.ok(new JwtResponse(jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                roles,
                                userDetails.getDepartmentId(),
                                userDetails.getMunicipalityId(),
                                userDetails.isPasswordChanged()));
        }

        @PostMapping("/register")
        public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
                if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Username is already taken!"));
                }

                if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Error: Email is already in use!"));
                }

                // Create new user's account
                User user = new User();
                user.setUsername(signUpRequest.getUsername());
                user.setEmail(signUpRequest.getEmail());
                user.setPassword(encoder.encode(signUpRequest.getPassword()));
                user.setFullName(signUpRequest.getFullName());
                user.setMobile(signUpRequest.getMobile());

                userRepository.save(user);

                return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        }

        @PostMapping("/change-password")
        public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                List<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toList());

                if (roles.contains("ROLE_ADMIN")) {
                        return adminRepository.findById(userDetails.getId())
                                        .map(admin -> {
                                                admin.setPassword(encoder.encode(changePasswordRequest.getPassword()));
                                                admin.setPasswordChanged(true);
                                                adminRepository.save(admin);
                                                return ResponseEntity.ok(
                                                                new MessageResponse("Password changed successfully!"));
                                        })
                                        .orElse(ResponseEntity.badRequest()
                                                        .body(new MessageResponse("Error: Admin not found!")));
                } else {
                        return userRepository.findById(userDetails.getId())
                                        .map(user -> {
                                                user.setPassword(encoder.encode(changePasswordRequest.getPassword()));
                                                userRepository.save(user);
                                                return ResponseEntity.ok(
                                                                new MessageResponse("Password changed successfully!"));
                                        })
                                        .orElse(ResponseEntity.badRequest()
                                                        .body(new MessageResponse("Error: User not found!")));
                }
        }

        @GetMapping("/debug-reset")
        public ResponseEntity<?> debugReset() {
                StringBuilder status = new StringBuilder();

                // Reset Super Admin
                if (adminRepository.findByUsername("suberAD").isPresent()) {
                        com.complaint.redressal.model.Admin admin = adminRepository.findByUsername("suberAD").get();
                        admin.setPassword(encoder.encode("suber24"));
                        admin.setRole(com.complaint.redressal.model.Admin.ROLE_SUPER_ADMIN);
                        adminRepository.save(admin);
                        status.append("Admin 'suberAD' reset to ROLE_SUPER_ADMIN. ");
                } else {
                        com.complaint.redressal.model.Admin admin = new com.complaint.redressal.model.Admin();
                        admin.setUsername("suberAD");
                        admin.setPassword(encoder.encode("suber24"));
                        admin.setRole(com.complaint.redressal.model.Admin.ROLE_SUPER_ADMIN);
                        adminRepository.save(admin);
                        status.append("Admin 'suberAD' created with ROLE_SUPER_ADMIN. ");
                }

                // Reset Municipality Admins
                String[] munAdmins = { "admin_chn:Chennai", "admin_cbe:Coimbatore", "admin_slm:Salem" };
                for (String entry : munAdmins) {
                        String[] parts = entry.split(":");
                        String username = parts[0];
                        String munName = parts[1];

                        municipalityRepository.findByName(munName).ifPresent(mun -> {
                                if (adminRepository.findByUsername(username).isPresent()) {
                                        com.complaint.redressal.model.Admin admin = adminRepository
                                                        .findByUsername(username).get();
                                        admin.setPassword(encoder.encode("admin123"));
                                        admin.setRole(com.complaint.redressal.model.Admin.ROLE_MUNICIPALITY_ADMIN);
                                        admin.setMunicipality(mun);
                                        adminRepository.save(admin);
                                        status.append("Reset ").append(username).append(". ");
                                } else {
                                        com.complaint.redressal.model.Admin admin = new com.complaint.redressal.model.Admin();
                                        admin.setUsername(username);
                                        admin.setPassword(encoder.encode("admin123"));
                                        admin.setRole(com.complaint.redressal.model.Admin.ROLE_MUNICIPALITY_ADMIN);
                                        admin.setMunicipality(mun);
                                        adminRepository.save(admin);
                                        status.append("Created ").append(username).append(". ");
                                }
                        });
                }

                return ResponseEntity.ok(status.toString());
        }

        @GetMapping("/debug-users")
        public ResponseEntity<?> getDebugUsers() {
                return ResponseEntity.ok(
                                userRepository.findAll().stream().map(User::getUsername).collect(Collectors.toList()));
        }
}
