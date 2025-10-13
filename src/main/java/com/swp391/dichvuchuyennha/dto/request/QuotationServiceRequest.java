package com.swp391.dichvuchuyennha.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotationServiceRequest {
    private Integer id;
    private Integer quotationId;
    private Integer serviceId;
    private Integer priceId;
    private Integer quantity;

}
