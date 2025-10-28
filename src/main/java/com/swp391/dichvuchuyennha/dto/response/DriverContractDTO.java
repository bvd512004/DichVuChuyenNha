package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverContractDTO {
    private Integer contractId;
    private String contractStatus;
    
    // Quotation info
    private Integer quotationId;
    private Double totalPrice;
    
    // Vehicle info
    private Integer vehicleId;
    private String vehicleType;
    private String licensePlate;
    
    // Request info
    private String pickupAddress;
    private String destinationAddress;
    private java.util.Date movingDay;
    private String description;
    
    // Customer info
    private String customerName;
    private String customerPhone;
    
    // Dates
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime signedDate;
    
    // Work progress
    private String workStatus;
}

