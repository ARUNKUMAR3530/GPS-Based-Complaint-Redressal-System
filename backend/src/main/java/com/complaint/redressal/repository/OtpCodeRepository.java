package com.complaint.redressal.repository;

import com.complaint.redressal.model.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findByIdentifier(String identifier);
    void deleteByIdentifier(String identifier);
}
