package com.swp391.dichvuchuyennha.dto.request;

import lombok.Data;
import java.time.LocalDate;

@Data
public class VehicleAssignmentRequest {
    private Integer contractId;
    private Integer vehicleId;
    private LocalDate assignedDate;
}

