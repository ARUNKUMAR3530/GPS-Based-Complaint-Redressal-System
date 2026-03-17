package com.complaint.redressal.repository;

import com.complaint.redressal.model.Complaint;
import com.complaint.redressal.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    List<StatusHistory> findByComplaintOrderByTimestampAsc(Complaint complaint);
}
