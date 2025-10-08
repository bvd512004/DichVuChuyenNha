package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Requests;
import com.swp391.dichvuchuyennha.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Requests, Integer> {

    List<Requests> findByStatus(String status);

    java.util.List<Requests> findByUserOrderByRequestTimeDesc(Users user);

}


