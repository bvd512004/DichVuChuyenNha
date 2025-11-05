package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Integer vehicleId;
    private String vehicleType;
    private String licensePlate;
    private Double capacity;
    private String status;
    private Integer quotationId;
    private Integer driverId;
    private String driverUsername; // Thêm username của driver
}
