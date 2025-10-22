package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.QuotationCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.QuotationForCustomer;
import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.mapper.QuotationMapper;
import com.swp391.dichvuchuyennha.repository.QuotationRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import com.swp391.dichvuchuyennha.service.EmployeePositionService;
import com.swp391.dichvuchuyennha.service.QuotationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;
    private final QuotationMapper mapper;
    private final QuotationRepository quotationRepository;
    private final UserRepository userRepository;
    private final EmployeePositionService employeePositionService;

    @PostMapping
    public ResponseEntity<Quotations> createQuotation(@RequestBody QuotationCreateRequest request) {
        Quotations savedQuotation = quotationService.createQuotation(request);
        return ResponseEntity.ok(savedQuotation);
    }
    @GetMapping("/me")
    @PreAuthorize("hasRole('employee') and @employeePositionService.hasPositionSurveyer(authentication)")

    public ResponseEntity<List<QuotationResponse>> getQuotationsByEmployee() {
        List<QuotationResponse> responses = quotationService.getQuotationsByCurrentEmployee();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/pending/me")
    public ResponseEntity<List<QuotationForCustomer>> getPendingQuotationsForCurrentUser() {
        // Lấy username đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Lấy thông tin user từ DB
        Users user = userRepository.findByUsername(username).orElseThrow();

        // Lấy danh sách quotation có trạng thái PENDING của user
        List<QuotationForCustomer> pendingQuotations =
                quotationService.getPendingQuotationsByUserId(user.getUserId());

        return ResponseEntity.ok(pendingQuotations);
    }
    @PutMapping("/approve/{quotationId}")
    public ResponseEntity<QuotationForCustomer> approveQuotation(@PathVariable Integer quotationId) {
        // Lấy username người đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Lấy user từ DB
        Users user = userRepository.findByUsername(username).orElseThrow();

        // Gọi service xử lý approve
        QuotationForCustomer approvedQuotation = quotationService.approveQuotation(quotationId, user.getUserId());

        return ResponseEntity.ok(approvedQuotation);
    }
    @PutMapping("/reject/{quotationId}")
    public ResponseEntity<QuotationForCustomer> rejectQuotation(@PathVariable Integer quotationId) {
        // 1️⃣ Lấy username người đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2️⃣ Lấy user từ DB
        Users user = userRepository.findByUsername(username).orElseThrow(
                () -> new EntityNotFoundException("User not found")
        );

        // 3️⃣ Gọi service xử lý từ chối báo giá
        QuotationForCustomer rejectedQuotation = quotationService.rejectQuotation(quotationId, user.getUserId());

        // 4️⃣ Trả về phản hồi cho FE
        return ResponseEntity.ok(rejectedQuotation);
    }


    @GetMapping
    public List<QuotationResponse> getApprovedQuotations() {
        List<Quotations> approvedQuotations = quotationRepository.findByStatus("APPROVED");
        return approvedQuotations.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

}
