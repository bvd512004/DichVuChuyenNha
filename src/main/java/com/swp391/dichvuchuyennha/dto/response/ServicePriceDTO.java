package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePriceDTO {
    private Integer serviceId;
    private String serviceName;
    private String description;
    private Boolean isActive;
    private String imageUrl;
    private List<PriceDTO> prices;
}

