package com.complaint.redressal.repository;

import com.complaint.redressal.model.Municipality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MunicipalityRepository extends JpaRepository<Municipality, Long> {
    Optional<Municipality> findByName(String name);
}
