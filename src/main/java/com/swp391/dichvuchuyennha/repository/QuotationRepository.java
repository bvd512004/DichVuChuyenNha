package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Quotations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotations, Integer> {
    // Có thể thêm query theo surveyId nếu cần
// QuotationRepository.java
    List<Quotations> findBySurvey_Request_AssignedEmployees_Employee_User_Username(String username);
    List<Quotations> findByStatus(String status);
    List<Quotations> findBySurvey_Request_User_UserIdAndStatus(Integer userId, String status);
// <- dùng trong service


}
