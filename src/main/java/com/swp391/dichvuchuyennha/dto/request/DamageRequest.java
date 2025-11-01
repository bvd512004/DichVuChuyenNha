package com.swp391.dichvuchuyennha.dto.request;

import lombok.Data;

@Data
public class DamageRequest {
    private Integer contractId;
    private String cause;
    private Double cost;
    private String imageUrl;
}
