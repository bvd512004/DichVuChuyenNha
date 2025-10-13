package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListQuotationServicesResponse {
    private Integer id;
    private String username;
    private String companyName;
    private String serviceName;
    private String priceType;
    private Integer quantity;
    private Double subtotal;

}
