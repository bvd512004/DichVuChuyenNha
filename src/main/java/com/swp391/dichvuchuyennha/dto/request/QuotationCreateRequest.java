package com.swp391.dichvuchuyennha.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuotationCreateRequest {
    private Integer surveyId;
    private Double totalPrice;
    private LocalDateTime createdAt;
    private List<Integer> additionalServiceIds;

}

