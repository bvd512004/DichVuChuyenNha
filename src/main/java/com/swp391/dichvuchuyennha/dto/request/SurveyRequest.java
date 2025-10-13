package com.swp391.dichvuchuyennha.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyRequest {
    private Integer requestId;



    private LocalDateTime surveyDate;
    private String addressFrom;
    private String addressTo;
    private String status;
    private Integer estimatedWorkers;
    private String listService;
}

