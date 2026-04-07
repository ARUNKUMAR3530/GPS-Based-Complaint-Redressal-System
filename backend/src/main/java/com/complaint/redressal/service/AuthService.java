package com.complaint.redressal.service;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.OtpCode;
import com.complaint.redressal.model.User;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.OtpCodeRepository;
import com.complaint.redressal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder encoder;

    public boolean identifierExists(String identifier) {
        return userRepository.findByUsername(identifier).isPresent() ||
               userRepository.findByMobile(identifier).isPresent() ||
               adminRepository.findByUsername(identifier).isPresent() ||
               adminRepository.findByMobile(identifier).isPresent();
    }

    @Transactional
    public void generateAndSendOtp(String identifier) {
        // 1. Generate a 6-digit random string
        Random random = new Random();
        int randomNum = 100000 + random.nextInt(900000);
        String otpValue = String.valueOf(randomNum);

        // 2. Clear previously existing OTPs (or update them)
        Optional<OtpCode> existingOtp = otpCodeRepository.findByIdentifier(identifier);
        OtpCode otpCode;
        if (existingOtp.isPresent()) {
            otpCode = existingOtp.get();
            otpCode.setOtpCode(otpValue);
            otpCode.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        } else {
            otpCode = new OtpCode();
            otpCode.setIdentifier(identifier);
            otpCode.setOtpCode(otpValue);
            otpCode.setExpiryTime(LocalDateTime.now().plusMinutes(5));
        }

        // 3. Save to database
        otpCodeRepository.save(otpCode);

        // 4. Simulate sending SMS
        System.out.println("\n=======================================================");
        System.out.println("OTP SIMULATION: Sending OTP to " + identifier);
        System.out.println("Your OTP Code is: " + otpValue);
        System.out.println("Note: This code expires in 5 minutes.");
        System.out.println("=======================================================\n");
    }

    public boolean verifyOtp(String identifier, String code) {
        Optional<OtpCode> otpCodeOpt = otpCodeRepository.findByIdentifier(identifier);
        
        if (otpCodeOpt.isPresent()) {
            OtpCode otpCode = otpCodeOpt.get();
            if (otpCode.getOtpCode().equals(code) && otpCode.getExpiryTime().isAfter(LocalDateTime.now())) {
                return true;
            }
        }
        return false;
    }

    @Transactional
    public boolean resetPassword(String identifier, String newPassword) {
        // Try to find the user/admin by username or mobile/email
        Optional<User> userOpt = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByMobile(identifier));
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);
            otpCodeRepository.deleteByIdentifier(identifier);
            return true;
        }

        Optional<Admin> adminOpt = adminRepository.findByUsername(identifier)
                .or(() -> adminRepository.findByMobile(identifier));
        
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setPassword(encoder.encode(newPassword));
            admin.setPasswordChanged(true); // Assuming recovery also counts as a change
            adminRepository.save(admin);
            otpCodeRepository.deleteByIdentifier(identifier);
            return true;
        }

        return false;
    }
}
