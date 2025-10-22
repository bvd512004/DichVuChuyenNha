package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationForCustomer {
    private Integer quotationId;
    private String username;
    private String companyName;
    private List<QuotationServiceInfo> services;
    private Double totalPrice;
    private LocalDateTime surveyDate;
    private String addressFrom;
    private String addressTo;


}
