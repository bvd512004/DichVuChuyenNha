package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.LoginHistory;
import com.swp391.dichvuchuyennha.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findByUser(Users user);
}