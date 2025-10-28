package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private Integer vehicleId;
    private String vehicleType;
    private String licensePlate;
    private Double capacity;
    private String status;
    private String driverName;
    private String driverPosition;
}