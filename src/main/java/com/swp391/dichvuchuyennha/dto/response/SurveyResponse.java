package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveyResponse {
    private int surveyId;
    private String addressFrom;
    private String addressTo;
    private int estimatedWorkers;
    private String status;
    private LocalDateTime surveyDate;

    private int requestId;
    private String username;
    private String companyName;
    private LocalDateTime requestTime;
   private String listService;





}

