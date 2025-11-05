package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.VehicleAssignRequest;
import com.swp391.dichvuchuyennha.dto.response.VehicleResponse;
import com.swp391.dichvuchuyennha.service.VehiclesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class VehiclesController {

    private final VehiclesService vehiclesService;

    /**
     * Lấy danh sách xe có sẵn để gán
     * GET /api/vehicles/available
     */
    @GetMapping("/available")
    public ResponseEntity<List<VehicleResponse>> getAvailableVehicles() {
        List<VehicleResponse> vehicles = vehiclesService.getAvailableVehicles();
        return ResponseEntity.ok(vehicles);
    }

    /**
     * Lấy danh sách xe đã được gán cho hợp đồng
     * GET /api/vehicles/contract/{contractId}
     */
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<VehicleResponse>> getVehiclesByContract(@PathVariable Integer contractId) {
        try {
            List<VehicleResponse> vehicles = vehiclesService.getVehiclesByContract(contractId);
            return ResponseEntity.ok(vehicles);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Gán xe cho hợp đồng
     * POST /api/vehicles/assign
     */
    @PostMapping("/assign")
    public ResponseEntity<VehicleResponse> assignVehicleToContract(@RequestBody VehicleAssignRequest request) {
        try {
            VehicleResponse response = vehiclesService.assignVehicleToContract(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Hủy gán xe khỏi hợp đồng
     * DELETE /api/vehicles/assign/{contractId}/{vehicleId}
     */
    @DeleteMapping("/assign/{contractId}/{vehicleId}")
    public ResponseEntity<Void> unassignVehicleFromContract(
            @PathVariable Integer contractId,
            @PathVariable Integer vehicleId) {
        try {
            vehiclesService.unassignVehicleFromContract(contractId, vehicleId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
