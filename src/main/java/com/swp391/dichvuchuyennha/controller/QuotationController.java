package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.QuotationCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.mapper.QuotationMapper;
import com.swp391.dichvuchuyennha.repository.QuotationRepository;
import com.swp391.dichvuchuyennha.service.QuotationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    @PostMapping
    public ResponseEntity<Quotations> createQuotation(@RequestBody QuotationCreateRequest request) {
        Quotations savedQuotation = quotationService.createQuotation(request);
        return ResponseEntity.ok(savedQuotation);
    }
    @GetMapping
    public ResponseEntity<List<QuotationResponse>> getAllQuotations() {
        List<QuotationResponse> responses = quotationService.getAllQuotations()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }



}
