package com.swp391.dichvuchuyennha.dto.response;

import com.swp391.dichvuchuyennha.entity.SurveyFloor;
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
public class QuotationResponse {
    private String quotationId;
    private Double totalPrice;
    private LocalDateTime createdAt;
    private  LocalDateTime surveyDate;
    private  String addressFrom;
    private String addressTo;
    private String username;
    private String companyName;
    private String status;
    private String phone;

    private List<QuotationServiceInfo> services;


}

