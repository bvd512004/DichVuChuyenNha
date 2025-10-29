package com.swp391.dichvuchuyennha.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDate;

@Data
public class VehicleAssignmentRequest {
    private Integer contractId;
    private Integer vehicleId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate assignedDate;
}

