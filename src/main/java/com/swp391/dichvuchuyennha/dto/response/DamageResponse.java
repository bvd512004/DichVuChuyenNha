package com.swp391.dichvuchuyennha.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DamageResponse {
    private Integer damageId;
    private Integer contractId;
    private String cause;
    private Double cost;
    private String status;
    private String imageUrl;
    private String employeeName;
    private String customerFeedback;
    private String managerFeedback;
}
