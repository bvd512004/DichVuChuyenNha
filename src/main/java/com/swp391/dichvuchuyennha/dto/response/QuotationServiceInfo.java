package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationServiceInfo {
    private Integer id;
    private String serviceName;
    private String priceType;
    private Integer quantity;
    private Double subtotal;
    private Double amount;
}
