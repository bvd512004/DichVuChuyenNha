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
public class ListPaymentResponse {
    private Integer paymentId;
    private Integer contractId;
    private Double amount;
    private String method;
    private String status;
    private String paymentType;
    private String username;
    private String email;
    private String phone;
    private LocalDate dueDate;
}
