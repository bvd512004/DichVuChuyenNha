package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}