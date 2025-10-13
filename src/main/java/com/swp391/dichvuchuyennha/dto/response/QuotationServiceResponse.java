package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotationServiceResponse {
    private Integer id;
    private Double subtotal;

    private Integer quotationId;
    private Integer serviceId;
    private Integer priceId;
    private Integer quantity;
}
