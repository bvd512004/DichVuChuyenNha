package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.response.EmployeeDTO;
import com.swp391.dichvuchuyennha.dto.response.RequestDto;
import com.swp391.dichvuchuyennha.entity.RequestAssignment;
import com.swp391.dichvuchuyennha.repository.RequestRepository;
import com.swp391.dichvuchuyennha.service.RequestAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/request-assignment")
public class RequestAssigmentController {
    @Autowired
    private RequestAssignmentService requestAssignmentService;
    private  RequestRepository  requestRepository;
    // Tạo assignment
    @PostMapping("/assign")
    public ResponseEntity<RequestAssignment> assignRequest(@RequestParam Integer requestId,
                                                           @RequestParam Integer employeeId) {
        RequestAssignment ra = requestAssignmentService.assignRequestToEmployee(requestId, employeeId);
        return ResponseEntity.ok(ra);
    }
    @GetMapping("/free-surveyers")
    public ResponseEntity<List<EmployeeDTO>> getFreeSurveyers() {
        List<EmployeeDTO> surveyers = requestAssignmentService.getFreeSurveyers();
        return ResponseEntity.ok(surveyers);
    }
    @GetMapping
    public List<RequestDto> getAllRequests() {
        return requestRepository.findAll()
                .stream()
                .map(r -> RequestDto.builder()
                        .requestId(r.getRequestId())
                        .username(r.getUser() != null ? r.getUser().getUsername() : "N/A")
                        .companyName(r.getBusiness() != null ? r.getBusiness().getCompanyName() : "N/A")
                        .requestTime(r.getRequestTime())
                        .status(r.getStatus())
                        .build()
                ).collect(Collectors.toList());
    }

}
