//package com.swp391.dichvuchuyennha.controller;
//
//import java.util.List;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.swp391.dichvuchuyennha.dto.request.VehicleCreateRequest;
//import com.swp391.dichvuchuyennha.dto.response.VehicleResponse;
//import com.swp391.dichvuchuyennha.service.VehiclesService;
//
//import lombok.RequiredArgsConstructor;
//
//@RestController
//@RequestMapping("/api/vehicles")
//@RequiredArgsConstructor
//public class VehiclesController {
//
//    private final VehiclesService vehiclesService;
//
//    @GetMapping
//    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
//        return ResponseEntity.ok(vehiclesService.getAllVehicles());
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable Integer id) {
//        return ResponseEntity.ok(vehiclesService.getVehicleById(id));
//    }
//
//    @PostMapping
//    public ResponseEntity<VehicleResponse> createVehicle(@RequestBody VehicleCreateRequest request) {
//        return ResponseEntity.ok(vehiclesService.createVehicle(request));
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<VehicleResponse> updateVehicle(@PathVariable Integer id,
//            @RequestBody VehicleCreateRequest request) {
//        return ResponseEntity.ok(vehiclesService.updateVehicle(id, request));
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id) {
//        vehiclesService.deleteVehicle(id);
//        return ResponseEntity.noContent().build();
//    }
//}