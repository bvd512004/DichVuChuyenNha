package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Integer paymentId;
    private Double amount;
    private String method;
    private String status;
    private String paymentType;
    private String checkoutUrl;
    private Long orderCode;
    private LocalDate dueDate;
}
