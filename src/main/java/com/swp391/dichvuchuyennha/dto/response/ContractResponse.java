package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {

    private Integer contractId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double depositAmount;
    private Double totalAmount;
    private String status;
    private LocalDateTime signedDate;
    private String username;
    private String companyName;
    // Thông tin user owner
    private LocalDate movingDay;

    // Thông tin người đã ký
    private Integer signedById;
    private String signedByUsername;

    // Thông tin bổ sung
    private String startLocation; // địa chỉ đi
    private String endLocation;
    private List<QuotationServiceInfo> services;
    private Double totalPrice;

// địa chỉ đến
}
//thêm moving_day

