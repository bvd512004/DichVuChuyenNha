package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long logId;
    private String username; // hoặc "SYSTEM"
    private String action;
    private String entity;
    private Integer entityId;
    private LocalDateTime createdAt;
}