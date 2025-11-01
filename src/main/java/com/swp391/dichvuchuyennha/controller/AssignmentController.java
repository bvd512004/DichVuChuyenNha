package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.AssignmentRequest;
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

    // Endpoint để gán nhân viên vào hợp đồng
    @PostMapping("/assign")
    public ResponseEntity<String> assignEmployee(
            @RequestBody AssignmentRequest assignmentRequest // Nhận đối tượng AssignmentRequest từ body
    ) {
        try {
            // Gọi service để gán nhân viên vào hợp đồng
            assignmentService.assignEmployeeToContract(
                    assignmentRequest.getContractId(),
                    assignmentRequest.getEmployeeId(),
                    assignmentRequest.getAssignedDate()
            );
            return ResponseEntity.ok("Gán nhân viên thành công");
        } catch (RuntimeException e) {
            // Trả về thông báo lỗi nếu gặp vấn đề khi gán nhân viên
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    // Endpoint để lấy danh sách nhân viên đã được gán cho hợp đồng
    @GetMapping("/{contractId}")
    public ResponseEntity<List<EmployeeDTO>> getAssignedEmployees(@PathVariable Integer contractId) {
        List<EmployeeDTO> employees = assignmentService.getAssignedEmployeesByContract(contractId);
        return ResponseEntity.ok(employees);
    }

    // Endpoint để bỏ gán nhân viên khỏi hợp đồng
    @DeleteMapping("/{contractId}/{employeeId}")
    public ResponseEntity<String> unassignEmployee(
            @PathVariable Integer contractId,
            @PathVariable Integer employeeId
    ) {
        try {
            // Gọi service để bỏ gán nhân viên
            assignmentService.unassignEmployee(contractId, employeeId);
            return ResponseEntity.ok("Bỏ gán nhân viên thành công");
        } catch (RuntimeException e) {
            // Trả về thông báo lỗi nếu không tìm thấy hoặc không thể bỏ gán nhân viên
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}//end
