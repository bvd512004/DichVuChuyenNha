package com.swp391.dichvuchuyennha.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeUpdateRequest {
    private String position;
    private String phone;
    private String status;
}
