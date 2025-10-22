package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.service.QuotationReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager/quotations")
@RequiredArgsConstructor
public class QuotationReviewController {

    private final QuotationReviewService quotationReviewService;

    // Lấy danh sách quotation REVIEW
    @GetMapping("/review")
    public ResponseEntity<List<QuotationResponse>> getReviewQuotations() {
        List<QuotationResponse> list = quotationReviewService.getReviewQuotations();
        return ResponseEntity.ok(list);
    }

    // Đồng ý quotation (REVIEW → PENDING)
    @PutMapping("/{quotationId}/approve") // ← đổi từ @PostMapping thành @PutMapping
    public ResponseEntity<QuotationResponse> approveQuotation(@PathVariable Integer quotationId) {
        QuotationResponse updated = quotationReviewService.approveReviewQuotation(quotationId);
        return ResponseEntity.ok(updated);
    }
    @PutMapping("/{quotationId}/reject")
    public ResponseEntity<QuotationResponse> rejectQuotation(@PathVariable Integer quotationId) {
        QuotationResponse updated = quotationReviewService.rejectReviewQuotation(quotationId);
        return ResponseEntity.ok(updated);
    }
}