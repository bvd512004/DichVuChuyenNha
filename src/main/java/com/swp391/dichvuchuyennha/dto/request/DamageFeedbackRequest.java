package com.swp391.dichvuchuyennha.dto.request;

import lombok.Data;

@Data
public class DamageFeedbackRequest {
    private String action; // approve | reject
    private String customerFeedback; // lý do từ chối nếu reject
    private String managerFeedback;
}
