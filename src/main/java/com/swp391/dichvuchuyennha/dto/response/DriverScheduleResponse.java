package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverScheduleResponse {
    private Integer contractId;
    private String contractStatus;
    private Integer vehicleId;
    private String vehicleType;
    private String licensePlate;
    private Double capacity;
    private LocalDate movingDay;
    private String pickupAddress;
    private String destinationAddress;
}


