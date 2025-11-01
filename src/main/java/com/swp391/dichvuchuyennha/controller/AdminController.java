package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.*;
import com.swp391.dichvuchuyennha.dto.response.*;
import com.swp391.dichvuchuyennha.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    // === USER MANAGEMENT ===
    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody UserCreateRequest request) {
        UserResponse user = adminService.createUser(request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("User created successfully")
                .result(user)
                .build());
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .message("All users")
                .result(users)
                .build());
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Integer userId, @RequestBody UserCreateRequest request) {
        UserResponse user = adminService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("User updated")
                .result(user)
                .build());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("User deleted")
                .build());
    }

    // === EMPLOYEE ===
    @PostMapping("/employees")
    public ResponseEntity<ApiResponse<UserResponse>> createEmployee(@RequestBody EmployeeCreateRequest request) {
        UserResponse result = adminService.createEmployeeUser(request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("Employee created successfully")
                .result(result)
                .build());
    }

    // === ROLES ===
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        List<RoleResponse> roles = adminService.getAllRoles();
        return ResponseEntity.ok(ApiResponse.<List<RoleResponse>>builder()
                .code(1000)
                .message("All roles")
                .result(roles)
                .build());
    }

    // === VEHICLES ===
    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles() {
        List<VehicleResponse> vehicles = adminService.getAllVehicles();
        return ResponseEntity.ok(ApiResponse.<List<VehicleResponse>>builder()
                .code(1000)
                .message("Vehicles list")
                .result(vehicles)
                .build());
    }

    @PostMapping("/vehicles")
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(@RequestBody VehicleCreateRequest request) {
        VehicleResponse vehicle = adminService.createVehicle(request);
        return ResponseEntity.ok(ApiResponse.<VehicleResponse>builder()
                .code(1000)
                .message("Vehicle created")
                .result(vehicle)
                .build());
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(@PathVariable Integer id, @RequestBody VehicleCreateRequest request) {
        VehicleResponse vehicle = adminService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.<VehicleResponse>builder()
                .code(1000)
                .message("Vehicle updated")
                .result(vehicle)
                .build());
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Integer id) {
        adminService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Vehicle deleted")
                .build());
    }

    // === LOGIN HISTORY ===
    @GetMapping("/users/{userId}/login-history")
    public ResponseEntity<ApiResponse<List<LoginHistoryResponse>>> getLoginHistory(@PathVariable Integer userId) {
        List<LoginHistoryResponse> history = adminService.getLoginHistory(userId);
        return ResponseEntity.ok(ApiResponse.<List<LoginHistoryResponse>>builder()
                .code(1000)
                .message("Login history")
                .result(history)
                .build());
    }

    // === AUDIT LOGS ===
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs() {
        List<AuditLogResponse> logs = adminService.getAuditLogs();
        return ResponseEntity.ok(ApiResponse.<List<AuditLogResponse>>builder()
                .code(1000)
                .message("System audit logs")
                .result(logs)
                .build());
    }
}