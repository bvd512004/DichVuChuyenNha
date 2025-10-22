package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.WorkProgressRequest;
import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Employee;
import com.swp391.dichvuchuyennha.entity.WorkProgress;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.mapper.WorkProgressMapper;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import com.swp391.dichvuchuyennha.repository.WorkProgressRepository;
import com.swp391.dichvuchuyennha.service.WorkProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkProgressServiceImpl implements WorkProgressService {

    private final WorkProgressRepository workProgressRepository;
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final WorkProgressMapper mapper;

    @Override
    public List<WorkProgressResponse> getByEmployeeId(Integer employeeId) {
        return workProgressRepository.findByEmployee_EmployeeId(employeeId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
//k
    @Override
    public WorkProgressResponse createWorkProgress(Integer employeeId, WorkProgressRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        WorkProgress progress = new WorkProgress();
        progress.setEmployee(employee);
        progress.setContract(contract);
        progress.setTaskDescription(request.getTaskDescription());
        progress.setProgressStatus(request.getProgressStatus());
        progress.setUpdatedAt(LocalDateTime.now());

        return mapper.toResponse(workProgressRepository.save(progress));
    }

    @Override
    public WorkProgressResponse updateWorkProgress(Integer progressId, Integer employeeId, WorkProgressRequest request) {
        WorkProgress progress = workProgressRepository.findById(progressId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_PROGRESS_NOT_FOUND));

        if (!progress.getEmployee().getEmployeeId().equals(employeeId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        progress.setTaskDescription(request.getTaskDescription());
        progress.setProgressStatus(request.getProgressStatus());
        progress.setUpdatedAt(LocalDateTime.now());

        return mapper.toResponse(workProgressRepository.save(progress));
    }

    @Override
    public void deleteWorkProgress(Integer progressId, Integer employeeId) {
        WorkProgress progress = workProgressRepository.findById(progressId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_PROGRESS_NOT_FOUND));

        if (!progress.getEmployee().getEmployeeId().equals(employeeId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        workProgressRepository.delete(progress);
    }
    @Override
    public WorkProgressResponse createWorkProgressForEmployee(WorkProgressRequest request, Integer managerId) {
        // 👉 Không dùng userId nữa, chỉ cần employeeId
        if (request.getEmployeeId() == null) {
            throw new AppException(ErrorCode.MISSING_PARAMETER);
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        // Kiểm tra trạng thái hợp đồng
        if (!"SIGNED".equalsIgnoreCase(contract.getStatus())) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

        // Kiểm tra hợp đồng có nhân viên được gán chưa
        if (contract.getAssignmentEmployees() == null || contract.getAssignmentEmployees().isEmpty()) {
            throw new AppException(ErrorCode.NO_EMPLOYEES_ASSIGNED);
        }

        // Kiểm tra nhân viên có nằm trong danh sách được gán không
        boolean isAssigned = contract.getAssignmentEmployees()
                .stream()
                .anyMatch(ae -> ae.getEmployee().getEmployeeId().equals(employee.getEmployeeId()));
        if (!isAssigned) {
            throw new AppException(ErrorCode.EMPLOYEE_NOT_ASSIGNED_TO_CONTRACT);
        }

        // Kiểm tra trạng thái nhân viên
        if (!"busy".equalsIgnoreCase(employee.getStatus())) {
            throw new AppException(ErrorCode.INVALID_EMPLOYEE_STATUS);
        }

        // Kiểm tra trùng work progress
        boolean exists = workProgressRepository
                .existsByContract_ContractIdAndEmployee_EmployeeId(contract.getContractId(), employee.getEmployeeId());
        if (exists) {
            throw new AppException(ErrorCode.WORK_PROGRESS_ALREADY_EXISTS);
        }

        // ✅ Tạo mới work progress
        WorkProgress progress = new WorkProgress();
        progress.setEmployee(employee);
        progress.setContract(contract);
        progress.setTaskDescription(request.getTaskDescription());
        progress.setProgressStatus(request.getProgressStatus());
        progress.setUpdatedAt(LocalDateTime.now());

        return mapper.toResponse(workProgressRepository.save(progress));
    }
}//fix
