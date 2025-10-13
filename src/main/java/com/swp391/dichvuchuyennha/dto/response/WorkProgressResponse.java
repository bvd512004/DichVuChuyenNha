package com.swp391.dichvuchuyennha.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class WorkProgressResponse {
    private Integer progressId;
    private Integer contractId;
    private Integer employeeId;
    private String taskDescription;
    private String progressStatus;
    private LocalDateTime updatedAt;
    private String customerName;    // Tên khách hàng hoặc công ty
    private String serviceName;     // Loại dịch vụ
    private LocalDate startDate;    // Ngày bắt đầu hợp đồng
    private LocalDate endDate;      // Ngày kết thúc dự kiến
    private Double totalAmount;     // Tổng tiền hợp đồng
    private String employeeName;    // Tên nhân viên phụ trách
}
//k