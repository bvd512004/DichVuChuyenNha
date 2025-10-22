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
public class ContractRequest {
    private Integer quotationId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double depositAmount;
    private Double totalAmount;
    private Integer signedById; // optional
}
