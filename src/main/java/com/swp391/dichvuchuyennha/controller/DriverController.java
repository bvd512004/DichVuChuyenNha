package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.response.DriverContractDTO;
import com.swp391.dichvuchuyennha.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DriverController {

    private final DriverService driverService;

    /**
     * Lấy danh sách hợp đồng của driver đang đăng nhập
     */
    @GetMapping("/contracts")
    public ResponseEntity<List<DriverContractDTO>> getDriverContracts() {
        List<DriverContractDTO> contracts = driverService.getDriverContracts();
        return ResponseEntity.ok(contracts);
    }

    /**
     * Bắt đầu công việc vận chuyển
     */
    @PostMapping("/contracts/{contractId}/start")
    public ResponseEntity<String> startWork(@PathVariable Integer contractId) {
        // TODO: Implement logic to start work
        return ResponseEntity.ok("Bắt đầu công việc thành công");
    }

    /**
     * Kết thúc công việc vận chuyển
     */
    @PostMapping("/contracts/{contractId}/complete")
    public ResponseEntity<String> completeWork(@PathVariable Integer contractId) {
        // TODO: Implement logic to complete work
        return ResponseEntity.ok("Hoàn thành công việc thành công");
    }
}

