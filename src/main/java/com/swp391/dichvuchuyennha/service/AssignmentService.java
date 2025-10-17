package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.EmployeeDTO;
import com.swp391.dichvuchuyennha.entity.AssignmentEmployee;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Employee;
import com.swp391.dichvuchuyennha.repository.AssignmentEmployeeRepository;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentEmployeeRepository assignmentRepo;
    private final EmployeeRepository employeeRepo;
    private final ContractRepository contractRepo;

    @Transactional
    public void assignEmployeeToContract(Integer contractId, Integer employeeId, LocalDate assignedDate) {
        // Lấy thông tin hợp đồng và nhân viên
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        Employee employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Kiểm tra trạng thái nhân viên
        if (!"free".equalsIgnoreCase(employee.getStatus())) {
            throw new RuntimeException("Employee is not free");
        }

        // Gán nhân viên vào hợp đồng
        AssignmentEmployee assignment = new AssignmentEmployee();
        assignment.setContract(contract);
        assignment.setEmployee(employee);
        assignment.setAssignedTime(assignedDate);

        assignmentRepo.save(assignment);

        // Cập nhật trạng thái nhân viên thành 'busy'
        employee.setStatus("busy");
        employeeRepo.save(employee);
    }
    /** ✅ Lấy danh sách nhân viên đã gán theo hợp đồng */
    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAssignedEmployeesByContract(Integer contractId) {
        List<AssignmentEmployee> assignments = assignmentRepo.findByContractContractId(contractId);
        return assignments.stream()
                .map(ae -> new EmployeeDTO(
                        ae.getEmployee().getEmployeeId(),
                        ae.getEmployee().getUser().getUsername(),
                        ae.getEmployee().getPosition()
                ))
                .collect(Collectors.toList());
    }

    /** ✅ Bỏ gán nhân viên khỏi hợp đồng */
    @Transactional
    public void unassignEmployee(Integer contractId, Integer employeeId) {
        AssignmentEmployee assignment = assignmentRepo.findByContractContractId(contractId).stream()
                .filter(ae -> ae.getEmployee().getEmployeeId().equals(employeeId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignmentRepo.delete(assignment);

        Employee employee = assignment.getEmployee();
        employee.setStatus("free");
        employeeRepo.save(employee);
    }
}//fix đủ
