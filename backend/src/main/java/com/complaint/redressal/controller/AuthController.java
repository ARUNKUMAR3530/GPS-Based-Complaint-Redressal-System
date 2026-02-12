package com.complaint.redressal.controller;

import com.complaint.redressal.model.User;
import com.complaint.redressal.model.Admin;
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

        @PostMapping("/admin/change-password")
        public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                return adminRepository.findById(userDetails.getId())
                                .map(admin -> {
                                        admin.setPassword(encoder.encode(changePasswordRequest.getPassword()));
                                        admin.setPasswordChanged(true);
                                        adminRepository.save(admin);
                                        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
                                })
                                .orElse(ResponseEntity.badRequest()
                                                .body(new MessageResponse("Error: Admin not found!")));
        }
}
