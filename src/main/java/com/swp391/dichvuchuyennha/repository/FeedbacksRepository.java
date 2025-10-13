package com.swp391.dichvuchuyennha.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.swp391.dichvuchuyennha.entity.Feedbacks;
import com.swp391.dichvuchuyennha.entity.Users;

public interface FeedbacksRepository extends JpaRepository<Feedbacks, Integer> {
    List<Feedbacks> findByUser(Users user);
}