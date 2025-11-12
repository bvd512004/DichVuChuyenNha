package com.swp391.dichvuchuyennha.dto.response;

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
public class InvoiceResponse {
    private Integer invoiceId;
    private LocalDateTime invoiceDate;
    private String username;
    private String email;
    private String phone;
    private String vatNumber;
    private Integer contractId;
    private Integer paymentId;
    private String type;
    private double totalAmount;
    private double depositAmount;    // Tổng DEPOSIT đã trả (cùng contract)
    private List<QuotationServiceInfo> services;
}
