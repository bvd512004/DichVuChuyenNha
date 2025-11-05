package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.PriceCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.PriceDTO;
import com.swp391.dichvuchuyennha.dto.response.ServicePriceDTO;
import com.swp391.dichvuchuyennha.service.PriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
public class PriceController {

    private final PriceService priceService;

    // Lấy toàn bộ danh sách dịch vụ và bảng giá tương ứng
    @GetMapping
    public ResponseEntity<List<ServicePriceDTO>> getAllServicePrices() {
        List<ServicePriceDTO> list = priceService.getAllServicePrices();
        return ResponseEntity.ok(list);
    }
    @GetMapping("/{id}")
    public ServicePriceDTO getServiceById(@PathVariable Integer id) {
        return priceService.getServicePriceById(id);
    }
    @PostMapping
    public ResponseEntity<ServicePriceDTO> createService(@RequestBody ServicePriceDTO dto) {
        ServicePriceDTO created = priceService.createService(dto);
        return ResponseEntity.ok(created);
    }
    @PostMapping("/add-price")
    public ResponseEntity<PriceDTO> createPrice(@RequestBody PriceCreateRequest request) {
        PriceDTO created = priceService.createPrice(request);
        return ResponseEntity.ok(created);
    }

}
