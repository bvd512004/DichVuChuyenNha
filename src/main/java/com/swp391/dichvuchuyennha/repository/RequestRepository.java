package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Requests;
import com.swp391.dichvuchuyennha.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Requests, Integer> {

    List<Requests> findByStatus(String status);

    java.util.List<Requests> findByUserOrderByRequestTimeDesc(Users user);

    @Query("SELECT DISTINCT r FROM Requests r " +
           "LEFT JOIN FETCH r.user " +
           "LEFT JOIN FETCH r.business " +
           "LEFT JOIN FETCH r.assignedEmployees")
    List<Requests> findAllWithDetails();

}


