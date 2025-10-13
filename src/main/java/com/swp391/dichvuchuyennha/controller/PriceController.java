package com.swp391.dichvuchuyennha.controller;

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

}
