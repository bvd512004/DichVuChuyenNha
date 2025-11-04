package com.swp391.dichvuchuyennha.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PriceCreateRequest {
    private String priceId;
    private String serviceId;
    private String priceType;
    private Double amount;
    private String unit;

}
