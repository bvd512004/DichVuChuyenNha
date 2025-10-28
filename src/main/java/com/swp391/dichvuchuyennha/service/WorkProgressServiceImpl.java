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

    @Override
    public WorkProgressResponse createWorkProgress(Integer employeeId, WorkProgressRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        // ✅ Kiểm tra xem nhân viên này có được gán cho hợp đồng này không
        boolean isAssigned = contract.getAssignmentEmployees()
                .stream()
                .anyMatch(ae -> ae.getEmployee().getEmployeeId().equals(employeeId));

        if (!isAssigned) {
            throw new AppException(ErrorCode.EMPLOYEE_NOT_ASSIGNED_TO_CONTRACT);
        }

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
        if (request.getEmployeeId() == null) {
            throw new AppException(ErrorCode.MISSING_PARAMETER);
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        if (!"SIGNED".equalsIgnoreCase(contract.getStatus())) {
            throw new AppException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

        // ✅ Kiểm tra xem nhân viên có thực sự được gán vào hợp đồng không
        boolean isAssigned = contract.getAssignmentEmployees()
                .stream()
                .anyMatch(ae -> ae.getEmployee().getEmployeeId().equals(employee.getEmployeeId()));

        if (!isAssigned) {
            throw new AppException(ErrorCode.EMPLOYEE_NOT_ASSIGNED_TO_CONTRACT);
        }

        // ✅ Kiểm tra xem nhân viên đã có progress nào trong hợp đồng này chưa
        boolean exists = workProgressRepository
                .existsByContract_ContractIdAndEmployee_EmployeeId(contract.getContractId(), employee.getEmployeeId());
        if (exists) {
            throw new AppException(ErrorCode.WORK_PROGRESS_ALREADY_EXISTS);
        }

        WorkProgress progress = new WorkProgress();
        progress.setEmployee(employee);
        progress.setContract(contract);
        progress.setTaskDescription(request.getTaskDescription());
        progress.setProgressStatus(request.getProgressStatus());
        progress.setUpdatedAt(LocalDateTime.now());

        return mapper.toResponse(workProgressRepository.save(progress));
    }

    @Override
    public List<WorkProgressResponse> getAllWorkProgress() {
        return workProgressRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkProgressResponse> getWorkProgressByContract(Integer contractId) {
        return workProgressRepository.findByContract_ContractId(contractId)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}
//end