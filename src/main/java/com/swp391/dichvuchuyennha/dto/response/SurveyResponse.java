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
public class SurveyResponse {
    private int surveyId;
    private String addressFrom;
    private String addressTo;
    private String status;
    private LocalDateTime surveyDate;
    private Double totalArea;
    private Integer numFloors;
    private Integer numRooms;
    private Double distanceKm;
    private String note;
    private int requestId;
    private String username;
    private String companyName;
    private LocalDateTime requestTime;
    private List<SurveyFloorResponse> surveyFloors;









}

