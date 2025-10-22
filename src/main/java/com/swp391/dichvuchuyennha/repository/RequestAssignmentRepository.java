package com.swp391.dichvuchuyennha.repository;


import com.swp391.dichvuchuyennha.entity.RequestAssignment;
import com.swp391.dichvuchuyennha.entity.Requests;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RequestAssignmentRepository  extends JpaRepository<RequestAssignment, Integer> {
    List<RequestAssignment> findByEmployee_EmployeeId(Integer employeeId);
    List<RequestAssignment> findByRequest(Requests request);


}


