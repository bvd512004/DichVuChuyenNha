package com.swp391.dichvuchuyennha.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.Date;

@Data
public class RequestCreateRequest {
    @NotBlank
    private String description;
    private Integer businessId;
    private Integer userId;
    @NotBlank
    private String pickupAddress;
    @NotBlank
    private String destinationAddress;
    private String movingType;
    // Optional: planned moving day
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    private Date movingDay;
}


