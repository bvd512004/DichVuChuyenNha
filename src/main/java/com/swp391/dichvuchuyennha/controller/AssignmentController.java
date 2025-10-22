package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.response.EmployeeDTO;
import com.swp391.dichvuchuyennha.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping("/assign")
    public ResponseEntity<String> assignEmployee(
            @RequestParam Integer contractId,
            @RequestParam Integer employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate assignedDate
    ) {
        assignmentService.assignEmployeeToContract(contractId, employeeId, assignedDate);
        return ResponseEntity.ok("Gán nhân viên thành công");
    }
    @GetMapping("/{contractId}")
    public ResponseEntity<List<EmployeeDTO>> getAssignedEmployees(@PathVariable Integer contractId) {
        List<EmployeeDTO> employees = assignmentService.getAssignedEmployeesByContract(contractId);
        return ResponseEntity.ok(employees);
    }

    /** ✅ Bỏ gán nhân viên khỏi hợp đồng */
    @DeleteMapping("/{contractId}/{employeeId}")
    public ResponseEntity<String> unassignEmployee(
            @PathVariable Integer contractId,
            @PathVariable Integer employeeId
    ) {
        assignmentService.unassignEmployee(contractId, employeeId);
        return ResponseEntity.ok("Employee unassigned successfully");
    }
}//fix
