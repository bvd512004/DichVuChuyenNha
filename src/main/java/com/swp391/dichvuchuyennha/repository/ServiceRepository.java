package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceRepository extends JpaRepository<Services, Integer> {
    List<Services> findByIsActiveTrue();
}
