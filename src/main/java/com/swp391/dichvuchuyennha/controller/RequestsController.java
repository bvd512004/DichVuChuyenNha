package com.swp391.dichvuchuyennha.controller;

import java.util.List;

import com.swp391.dichvuchuyennha.service.RequestAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.swp391.dichvuchuyennha.dto.request.ApiResponse;
import com.swp391.dichvuchuyennha.dto.request.RequestCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.RequestDto;
import com.swp391.dichvuchuyennha.dto.response.RequestResponse;
import com.swp391.dichvuchuyennha.entity.Users;
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
    private final RequestAssignmentService requestAssignmentService;
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<RequestResponse>> create(@Valid @RequestBody RequestCreateRequest requestDto) {
        try {
            String context = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Creating request for user: " + context);
            System.out.println("Request DTO: " + requestDto);

            Users user = userRepository.findByUsername(context).orElseThrow();
            RequestResponse data = requestService.createRequest(user, requestDto);
            return ResponseEntity.ok(ApiResponse.<RequestResponse>builder().result(data).build());
        } catch (Exception e) {
            System.err.println("Error creating request: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RequestResponse>>> getMyRequests() {
        String context = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = userRepository.findByUsername(context).orElseThrow();
        List<RequestResponse> data = requestService.getMyRequests(user);
        return ResponseEntity.ok(ApiResponse.<List<RequestResponse>>builder().result(data).build());
    }

    @GetMapping
    public ResponseEntity<List<RequestDto>> getAllRequests() {
        // Debug: Log authentication info
       
        
        
        List<RequestDto> data = requestService.getAllRequests();
        return ResponseEntity.ok(data);
    }
    @GetMapping("/my-requests")
    public ResponseEntity<List<RequestDto>> getMyAssignedRequests() {
        List<RequestDto> requests = requestAssignmentService.getRequestsForLoggedInSurveyer();
        return ResponseEntity.ok(requests);
    }

    // Update status của request
    @PutMapping("/{requestId}/status")
    public ResponseEntity<RequestDto> updateRequestStatus(
            @PathVariable Integer requestId,
            @RequestParam String status) {
        RequestDto updated = requestService.updateRequestStatus(requestId, status);
        return ResponseEntity.ok(updated);
    }

}


