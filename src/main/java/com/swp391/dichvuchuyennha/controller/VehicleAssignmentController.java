package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.VehicleAssignmentRequest;
import com.swp391.dichvuchuyennha.dto.response.VehicleDTO;
import com.swp391.dichvuchuyennha.service.VehicleAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicle-assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleAssignmentController {

    private final VehicleAssignmentService vehicleAssignmentService;

    // Endpoint để gán xe vào hợp đồng
    @PostMapping("/assign")
    public ResponseEntity<String> assignVehicle(
            @RequestBody VehicleAssignmentRequest vehicleAssignmentRequest
    ) {
        try {
            // Gọi service để gán xe vào hợp đồng
            vehicleAssignmentService.assignVehicleToContract(
                    vehicleAssignmentRequest.getContractId(),
                    vehicleAssignmentRequest.getVehicleId(),
                    vehicleAssignmentRequest.getAssignedDate()
            );
            return ResponseEntity.ok("Gán xe thành công");
        } catch (RuntimeException e) {
            // Trả về thông báo lỗi nếu gặp vấn đề khi gán xe
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint để lấy danh sách xe đã được gán cho hợp đồng
    @GetMapping("/{contractId}")
    public ResponseEntity<List<VehicleDTO>> getAssignedVehicles(@PathVariable Integer contractId) {
        List<VehicleDTO> vehicles = vehicleAssignmentService.getAssignedVehiclesByContract(contractId);
        return ResponseEntity.ok(vehicles);
    }

    // Endpoint để lấy danh sách xe có sẵn
    @GetMapping("/available")
    public ResponseEntity<List<VehicleDTO>> getAvailableVehicles() {
        List<VehicleDTO> vehicles = vehicleAssignmentService.getAvailableVehicles();
        return ResponseEntity.ok(vehicles);
    }

    // Endpoint để bỏ gán xe khỏi hợp đồng
    @DeleteMapping("/unassign")
    public ResponseEntity<String> unassignVehicle(
            @RequestParam Integer contractId,
            @RequestParam Integer vehicleId
    ) {
        try {
            vehicleAssignmentService.unassignVehicle(contractId, vehicleId);
            return ResponseEntity.ok("Bỏ gán xe thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

