package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.ApiResponse;
import com.swp391.dichvuchuyennha.dto.request.CustomerCompanyRequest;
import com.swp391.dichvuchuyennha.dto.request.UserCreateRequest;
import com.swp391.dichvuchuyennha.dto.request.UserUpdateRequest;
import com.swp391.dichvuchuyennha.dto.response.RoleResponse;
import com.swp391.dichvuchuyennha.dto.response.UserResponse;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.repository.RoleRepository;
import com.swp391.dichvuchuyennha.service.AuthenticationService;
import com.swp391.dichvuchuyennha.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;
    private final RoleRepository roleRepository;
    private final AuthenticationService authService;

    // ✅ Lấy profile của user đang đăng nhập
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getProfile(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UserResponse user = authService.getUserFromToken(token);
        return ResponseEntity.ok(user);
    }

    // ✅ Update profile cá nhân
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserUpdateRequest request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.<UserResponse>builder()
                            .code(401)
                            .message("Unauthorized")
                            .build());
        }
        String token = authHeader.substring(7);
        Users user = authService.verifyAndParseToken(token);
        UserResponse updated = userService.updateUser(user.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("Profile updated successfully")
                .result(updated)
                .build());
    }

    // ✅ Đăng ký khách hàng doanh nghiệp
    @PostMapping("/customer-company")
    public ResponseEntity<ApiResponse<UserResponse>> createCustomerCompany(
            @RequestBody CustomerCompanyRequest request) {
        UserResponse response = userService.createCustomerCompanyUser(request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("Customer company created successfully")
                .result(response)
                .build());
    }

    // ✅ API tạo user (Admin dùng)
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody UserCreateRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("User created successfully")
                .result(user)
                .build());
    }

    // ✅ Lấy danh sách role dành cho khách hàng
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getCustomerRoles() {

        List<RoleResponse> roles = roleRepository.findByRoleIdIn(List.of(4, 5))
                .stream()
                .map(r -> new RoleResponse(r.getRoleId(), r.getRoleName()))
                .toList();

        return ResponseEntity.ok(ApiResponse.<List<RoleResponse>>builder()
                .code(1000)
                .message("Customer roles list")
                .result(roles)
                .build());
    }

    // ✅ Lấy danh sách toàn bộ user (Admin)
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .message("User list fetched successfully")
                .result(users)
                .build());
    }

    // ✅ Update user (Admin)
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Integer userId,
            @RequestBody UserCreateRequest request) {
        UserResponse updatedUser = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(1000)
                .message("User updated successfully")
                .result(updatedUser)
                .build());
    }

    // ✅ Xóa user (Admin)
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("User deleted successfully")
                .build());
    }
}





//package com.swp391.dichvuchuyennha.controller;
//
//import java.util.List;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestHeader;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.swp391.dichvuchuyennha.dto.request.ApiResponse;
//import com.swp391.dichvuchuyennha.dto.request.CustomerCompanyRequest;
//import com.swp391.dichvuchuyennha.dto.request.UserCreateRequest;
//import com.swp391.dichvuchuyennha.dto.request.UserUpdateRequest;
//import com.swp391.dichvuchuyennha.dto.response.RoleResponse;
//import com.swp391.dichvuchuyennha.dto.response.UserResponse;
//import com.swp391.dichvuchuyennha.entity.Users;
//import com.swp391.dichvuchuyennha.repository.RoleRepository;
//import com.swp391.dichvuchuyennha.service.AuthenticationService;
//import com.swp391.dichvuchuyennha.service.UserService;
//
//import lombok.RequiredArgsConstructor;
//
//@RestController
//@RequestMapping("/api/users")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173")
//public class UserController {
//
//        private final UserService userService;
//        private final RoleRepository roleRepository;
//        private final AuthenticationService authService;
//
//        // Lấy profile của user đang đăng nhập
//        @GetMapping("/me")
//        public ResponseEntity<UserResponse> getProfile(@RequestHeader("Authorization") String authHeader) {
//                String token = authHeader.substring(7); // bỏ "Bearer "
//                UserResponse user = authService.getUserFromToken(token);
//                return ResponseEntity.ok(user);
//        }
//
//        // Cập nhật profile
//        @PutMapping("/me")
//        public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
//                        @RequestHeader("Authorization") String authHeader,
//                        @RequestBody UserUpdateRequest request) {
//
//                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//                        return ResponseEntity.status(401)
//                                        .body(ApiResponse.<UserResponse>builder()
//                                                        .code(401)
//                                                        .message("Unauthorized")
//                                                        .build());
//                }
//
//                String token = authHeader.substring(7);
//                Users user = authService.verifyAndParseToken(token);
//
//                UserResponse updated = userService.updateUser(user.getUserId(), request);
//
//                return ResponseEntity.ok(
//                                ApiResponse.<UserResponse>builder()
//                                                .code(1000)
//                                                .message("Profile updated successfully")
//                                                .result(updated)
//                                                .build());
//        }
//
//        @PostMapping("/create")
//        public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody UserCreateRequest request) {
//                UserResponse user = userService.createUser(request);
//                return ResponseEntity.ok(
//                                ApiResponse.<UserResponse>builder()
//                                                .code(1000)
//                                                .message("User created successfully")
//                                                .result(user)
//                                                .build());
//        }
//
//        @GetMapping("/roles")
//        public ResponseEntity<ApiResponse<List<RoleResponse>>> getCustomerRoles() {
//                List<RoleResponse> roles = roleRepository.findByRoleIdIn(List.of(4, 5))
//                                .stream()
//                                .map(r -> new RoleResponse(r.getRoleId(), r.getRoleName()))
//                                .toList();
//
//                return ResponseEntity.ok(
//                                ApiResponse.<List<RoleResponse>>builder()
//                                                .code(1000)
//                                                .message("Customer roles list")
//                                                .result(roles)
//                                                .build());
//        }
//
//        @PostMapping("/customer-company")
//        public ResponseEntity<ApiResponse<UserResponse>> createCustomerCompany(
//                        @RequestBody CustomerCompanyRequest request) {
//                UserResponse response = userService.createCustomerCompanyUser(request);
//                return ResponseEntity.ok(
//                                ApiResponse.<UserResponse>builder()
//                                                .code(1000)
//                                                .message("Customer company created successfully")
//                                                .result(response)
//                                                .build());
//        }
//
//        @GetMapping
//        public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
//                List<UserResponse> users = userService.getAllUsers();
//                return ResponseEntity.ok(
//                                ApiResponse.<List<UserResponse>>builder()
//                                                .code(1000)
//                                                .message("User list fetched successfully")
//                                                .result(users)
//                                                .build());
//        }
//
//        @PutMapping("/{userId}")
//        public ResponseEntity<ApiResponse<UserResponse>> updateUser(
//                        @PathVariable Integer userId,
//                        @RequestBody UserCreateRequest request) {
//                UserResponse updatedUser = userService.updateUser(userId, request);
//                return ResponseEntity.ok(
//                                ApiResponse.<UserResponse>builder()
//                                                .code(1000)
//                                                .message("User updated successfully")
//                                                .result(updatedUser)
//                                                .build());
//        }
//
//        @DeleteMapping("/{userId}")
//        public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer userId) {
//                userService.deleteUser(userId);
//                return ResponseEntity.ok(
//                                ApiResponse.<Void>builder()
//                                                .code(1000)
//                                                .message("User deleted successfully")
//                                                .build());
//        }
//}
//package com.swp391.dichvuchuyennha.controller;
//
//import com.swp391.dichvuchuyennha.entity.Users;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import com.swp391.dichvuchuyennha.dto.request.ApiResponse;
//import com.swp391.dichvuchuyennha.dto.request.CustomerCompanyRequest;
//import com.swp391.dichvuchuyennha.dto.request.UserUpdateRequest;
//import com.swp391.dichvuchuyennha.dto.response.UserResponse;
//import com.swp391.dichvuchuyennha.service.AuthenticationService;
//import com.swp391.dichvuchuyennha.service.UserService;
//import lombok.RequiredArgsConstructor;
//
//@RestController
//@RequestMapping("/api/users")
//@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173")
//public class UserController {
//
//    private final UserService userService;
//    private final AuthenticationService authService;
//
//    // ✅ Profile cá nhân (authenticated)
//    @GetMapping("/me")
//    public ResponseEntity<UserResponse> getProfile(@RequestHeader("Authorization") String authHeader) {
//        String token = authHeader.substring(7);
//        UserResponse user = authService.getUserFromToken(token);
//        return ResponseEntity.ok(user);
//    }
//
//    // ✅ Update profile cá nhân
//    @PutMapping("/me")
//    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
//            @RequestHeader("Authorization") String authHeader,
//            @RequestBody UserUpdateRequest request) {
//        String token = authHeader.substring(7);
//        Users user = authService.verifyAndParseToken(token);
//        UserResponse updated = userService.updateUser(user.getUserId(), request);
//        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
//                .code(1000)
//                .message("Profile updated successfully")
//                .result(updated)
//                .build());
//    }
//
//    // ✅ Tạo customer company (public cho đăng ký)
//    @PostMapping("/customer-company")
//    public ResponseEntity<ApiResponse<UserResponse>> createCustomerCompany(
//            @RequestBody CustomerCompanyRequest request) {
//        UserResponse response = userService.createCustomerCompanyUser(request);
//        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
//                .code(1000)
//                .message("Customer company created successfully")
//                .result(response)
//                .build());
//    }
//}