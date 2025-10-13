package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;

import java.util.List;

public interface WorkProgressCustomerService {
    List<WorkProgressResponse> getWorkProgressForCustomer(Integer userId);
    List<WorkProgressResponse> getWorkProgressByContract(Integer userId, Integer contractId);
}
//k