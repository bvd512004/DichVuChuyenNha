package com.swp391.dichvuchuyennha.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RequestDto {
    private Integer requestId;
    private String username;
    private String companyName;
    private LocalDateTime requestTime;
    private String status;
    private String pickupAddress;
    private String destinationAddress;
    private String assignmentStatus; // status của RequestAssignment

}

