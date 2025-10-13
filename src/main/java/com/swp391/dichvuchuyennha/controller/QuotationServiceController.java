package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.QuotationServiceRequest;
import com.swp391.dichvuchuyennha.dto.response.ListQuotationServicesResponse;
import com.swp391.dichvuchuyennha.dto.response.QuotationServiceResponse;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import com.swp391.dichvuchuyennha.service.QuotationSvService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotation-services")
@RequiredArgsConstructor
public class QuotationServiceController {

    private final QuotationSvService quotationSvService;

    // ===== Tạo mới QuotationService =====
    @PostMapping
    public ResponseEntity<QuotationServiceResponse> create(@RequestBody QuotationServiceRequest request) {
        QuotationServices created = quotationSvService.create(request);
        return ResponseEntity.ok(toResponse(created));
    }
    @GetMapping
    public ResponseEntity<List<ListQuotationServicesResponse>> getAllQuotationServices() {
        List<ListQuotationServicesResponse> list = quotationSvService.getAllQuotationServices();
        return ResponseEntity.ok(list);
    }



    // ===== Chuyển entity sang response DTO =====
    private QuotationServiceResponse toResponse(QuotationServices entity) {
        return QuotationServiceResponse.builder()
                .id(entity.getId())
                .quotationId(entity.getQuotation().getQuotationId())
                .serviceId(entity.getService().getServiceId())
                .priceId(entity.getPrice().getPriceId())
                .subtotal(entity.getSubtotal())
                .build();
    }
    @PutMapping("/{id}")
    public QuotationServices updateQuantity(@PathVariable Integer id, @RequestParam Integer quantity) {
        return quotationSvService.updateQuantity(id, quantity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        quotationSvService.delete(id);
    }
}
