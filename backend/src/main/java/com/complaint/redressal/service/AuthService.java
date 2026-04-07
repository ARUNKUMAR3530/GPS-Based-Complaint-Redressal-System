package com.complaint.redressal.service;

import com.complaint.redressal.model.OtpCode;
import com.complaint.redressal.repository.OtpCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private OtpCodeRepository otpCodeRepository;

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
}
