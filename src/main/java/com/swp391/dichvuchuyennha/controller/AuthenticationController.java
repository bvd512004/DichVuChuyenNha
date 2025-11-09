package com.swp391.dichvuchuyennha.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.swp391.dichvuchuyennha.dto.request.ApiResponse;
import com.swp391.dichvuchuyennha.dto.request.AuthenticationRequest;
import com.swp391.dichvuchuyennha.dto.response.AuthenticationResponse;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.service.AuthenticationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // chỉ cho phép React gọi

public class AuthenticationController {

        private final AuthenticationService authenticationService;

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
                        @RequestBody AuthenticationRequest request) {
                // Log để debug
                System.out.println("=== LOGIN REQUEST ===");
                System.out.println("Request: " + request);
                System.out.println("Email: " + (request != null ? request.getEmail() : "null"));
                System.out.println("Password: " + (request != null ? (request.getPassword() != null ? "***" : "null") : "null"));
                
                if (request == null || request.getEmail() == null || request.getPassword() == null) {
                        System.out.println("ERROR: Request body is invalid");
                        return ResponseEntity.badRequest().body(
                                        ApiResponse.<AuthenticationResponse>builder()
                                                        .code(ErrorCode.INVALID_REQUEST.getCode())
                                                        .message("Email and password are required")
                                                        .build());
                }
                var result = authenticationService.authenticate(request);
                return ResponseEntity.ok(
                                ApiResponse.<AuthenticationResponse>builder()
                                                .message("Login successful")
                                                .result(result)
                                                .build());
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        authenticationService.logout(token);
                }
                return ResponseEntity.ok().body("Logged out successfully");
        }

        // : Forgot password - gửi OTP
        @PostMapping("/forgot-password")
        public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> body) {
                String email = body.get("email");
                if (email == null || email.isBlank()) {
                        return ResponseEntity.badRequest().body(
                                        ApiResponse.<String>builder()
                                                        .code(1001)
                                                        .message("Email is required")
                                                        .build());
                }
                authenticationService.sendOtpForReset(email);
                return ResponseEntity.ok(
                                ApiResponse.<String>builder()
                                                .message("OTP sent to your email")
                                                .build());
        }

        // : Verify OTP
        @PostMapping("/verify-otp")
        public ResponseEntity<ApiResponse<Boolean>> verifyOtp(@RequestBody Map<String, String> body) {
                String email = body.get("email");
                String otp = body.get("otp");
                if (email == null || otp == null) {
                        return ResponseEntity.badRequest().body(
                                        ApiResponse.<Boolean>builder()
                                                        .code(1001)
                                                        .message("Email and OTP required")
                                                        .build());
                }
                boolean valid = authenticationService.verifyOtp(email, otp);
                return ResponseEntity.ok(
                                ApiResponse.<Boolean>builder()
                                                .message(valid ? "OTP valid" : "Invalid or expired OTP")
                                                .result(valid)
                                                .build());
        }

        // : Reset password
        @PostMapping("/reset-password")
        public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody Map<String, String> body) {
                String email = body.get("email");
                String newPassword = body.get("newPassword");
                String otp = body.get("otp");
                if (email == null || newPassword == null || otp == null) {
                        return ResponseEntity.badRequest().body(
                                        ApiResponse.<String>builder()
                                                        .code(1001)
                                                        .message("Email, OTP and new password required")
                                                        .build());
                }
                authenticationService.resetPassword(email, newPassword, otp);
                return ResponseEntity.ok(
                                ApiResponse.<String>builder()
                                                .message("Password reset successful")
                                                .build());
        }
}
