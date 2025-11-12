package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.CustomerCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerCompanyRepository extends JpaRepository<CustomerCompany, Integer> {
    Optional<CustomerCompany> findByUser_UserId(Integer userId);
}
