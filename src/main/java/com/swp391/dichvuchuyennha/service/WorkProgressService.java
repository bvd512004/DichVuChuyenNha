package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.WorkProgressRequest;
import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;

import java.util.List;

public interface WorkProgressService {
    List<WorkProgressResponse> getByEmployeeId(Integer employeeId);
    WorkProgressResponse createWorkProgress(Integer employeeId, WorkProgressRequest request);
    WorkProgressResponse updateWorkProgress(Integer progressId, Integer employeeId, WorkProgressRequest request);
    void deleteWorkProgress(Integer progressId, Integer employeeId);
    WorkProgressResponse createWorkProgressForEmployee(WorkProgressRequest request, Integer managerId);
}
//l