package com.swp391.dichvuchuyennha.controller;

import java.util.List;
import java.util.stream.Collectors;

import com.swp391.dichvuchuyennha.entity.RequestAssignment;
import com.swp391.dichvuchuyennha.service.RequestAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.swp391.dichvuchuyennha.dto.request.ApiResponse;
import com.swp391.dichvuchuyennha.dto.request.RequestCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.RequestDto;
import com.swp391.dichvuchuyennha.dto.response.RequestResponse;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.repository.RequestRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import com.swp391.dichvuchuyennha.service.RequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;






@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestsController {

    private final RequestService requestService;
    private final UserRepository userRepository;
    private final RequestRepository requestRepository;
    private final RequestAssignmentService requestAssignmentService;
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<RequestResponse>> create(@Valid @RequestBody RequestCreateRequest requestDto) {
        String context = SecurityContextHolder.getContext().getAuthentication().getName();

        Users user = userRepository.findByUsername(context).orElseThrow();
        RequestResponse data = requestService.createRequest(user, requestDto);
        return ResponseEntity.ok(ApiResponse.<RequestResponse>builder().result(data).build());
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RequestResponse>>> getMyRequests() {
        String context = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByUsername(context).orElseThrow();
        List<RequestResponse> data = requestService.getMyRequests(user);
        return ResponseEntity.ok(ApiResponse.<List<RequestResponse>>builder().result(data).build());
    }

    @GetMapping
    public List<RequestDto> getAllRequests() {
        return requestRepository.findAll()
                .stream()
                .map(r -> {
                    // Lấy assignment gần nhất nếu có
                    RequestAssignment assignment = r.getAssignedEmployees() != null && !r.getAssignedEmployees().isEmpty()
                            ? r.getAssignedEmployees().get(0)  // nếu nhiều assignment, có thể sort theo date
                            : null;

                    return RequestDto.builder()
                            .requestId(r.getRequestId())
                            .username(r.getUser() != null ? r.getUser().getUsername() : "N/A")
                            .companyName(r.getBusiness() != null ? r.getBusiness().getCompanyName() : "N/A")
                            .requestTime(r.getRequestTime())
                            .status(r.getStatus())
                            .assignmentStatus(assignment != null ? assignment.getStatus() : "NOT_ASSIGNED")
                            .pickupAddress(r.getPickupAddress())
                            .build();
                })
                .collect(Collectors.toList());
    }
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('employee') and @employeePositionService.hasPositionSurveyer(authentication)")

    public ResponseEntity<List<RequestDto>> getMyAssignedRequests() {
        List<RequestDto> requests = requestAssignmentService.getRequestsForLoggedInSurveyer();
        return ResponseEntity.ok(requests);
    }

}


