package com.complaint.redressal.repository;

import com.complaint.redressal.model.Complaint;
import com.complaint.redressal.model.ComplaintStatus;
import com.complaint.redressal.model.Department;
import com.complaint.redressal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.complaint.redressal.model.Municipality;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUser(User user);

    List<Complaint> findByAssignedDepartment(Department department);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findByAssignedDepartmentAndStatus(Department department, ComplaintStatus status);

    List<Complaint> findByMunicipality(Municipality municipality);

    long countByAssignedDepartment(Department department);

    long countByAssignedDepartmentAndStatus(Department department, ComplaintStatus status);

    long countByMunicipality(Municipality municipality);

    long countByMunicipalityAndStatus(Municipality municipality, ComplaintStatus status);
}
