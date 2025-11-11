package com.swp391.dichvuchuyennha.dto.request;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {
    private Integer contractId;
    private Integer userId;
    private Integer rating;
    private String comment;
}
