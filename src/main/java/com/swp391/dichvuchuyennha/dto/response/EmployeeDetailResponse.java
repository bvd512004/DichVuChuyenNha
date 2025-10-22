package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDetailResponse {
    private Integer employeeId;
    private Integer userId;
    private String username;
    private String email;
    private String phone;
    private String position;
    private String status;
    private String roleName;
    
    // Contract history information
    private List<EmployeeContractHistory> contractHistory;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeContractHistory {
        private Integer contractId;
        private String contractStatus;
        private String assignedTime;
        private String startDate;
        private String endDate;
        private Double totalAmount;
    }
}
