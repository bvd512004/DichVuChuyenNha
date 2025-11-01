package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CustomerWorkProgressResponse {
    private Long id;
    private Long contractId;
    private String taskDescription;
    private String progressStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String employeeName;
    private String vehicleInfo;
    private String note;

}//h
