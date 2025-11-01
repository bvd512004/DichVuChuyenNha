package com.swp391.dichvuchuyennha.controller;

import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.dichvuchuyennha.dto.request.DamageFeedbackRequest;
import com.swp391.dichvuchuyennha.dto.request.DamageRequest;
import com.swp391.dichvuchuyennha.dto.response.DamageResponse;
import com.swp391.dichvuchuyennha.entity.Employee;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import com.swp391.dichvuchuyennha.service.DamagesService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.ParseException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/damages")
@RequiredArgsConstructor
public class DamagesController {

    private final DamagesService damagesService;
    private final EmployeeRepository employeeRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String token = authHeader.substring(7);
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(jwtSecret.getBytes());
            boolean valid = signedJWT.verify(verifier);
            if (!valid) throw new AppException(ErrorCode.UNAUTHENTICATED);
            Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiry.before(new Date())) throw new AppException(ErrorCode.UNAUTHENTICATED);
            return signedJWT.getJWTClaimsSet().getLongClaim("userId");
        } catch (ParseException | com.nimbusds.jose.JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    // 👷 Nhân viên tạo damage
    @PostMapping
    public ResponseEntity<DamageResponse> createDamage(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody DamageRequest request) {

        Long userId = extractUserIdFromToken(authHeader);
        Employee employee = employeeRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return ResponseEntity.ok(damagesService.createDamage(employee.getEmployeeId(), request));
    }

    // 👤 Khách hàng phản hồi (approve / reject)
    @PutMapping("/{damageId}/feedback")
    public ResponseEntity<DamageResponse> feedbackDamage(
            @PathVariable Integer damageId,
            @RequestBody DamageFeedbackRequest feedback) {
        return ResponseEntity.ok(damagesService.updateStatus(damageId, feedback));
    }

    // 👷 Nhân viên cập nhật lại damage sau khi bị reject
    @PutMapping("/{damageId}")
    public ResponseEntity<DamageResponse> updateDamage(
            @PathVariable Integer damageId,
            @RequestBody DamageRequest request) {
        return ResponseEntity.ok(damagesService.updateDamage(damageId, request));
    }

    // 🔍 Cả nhân viên và khách hàng đều xem danh sách damage theo hợp đồng
    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<DamageResponse>> getByContract(@PathVariable Integer contractId) {
        return ResponseEntity.ok(damagesService.getByContractId(contractId));
    }

    // 👨‍💼 Quản lý phản hồi (approve / reject)
    @PutMapping("/{damageId}/manager-feedback")
    public ResponseEntity<DamageResponse> managerFeedbackDamage(
            @PathVariable Integer damageId,
            @RequestBody DamageFeedbackRequest feedback) {
        return ResponseEntity.ok(damagesService.updateManagerStatus(damageId, feedback));
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadDamageImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // ✅ Thư mục lưu ảnh thực tế trên máy bạn
            String uploadDir = "C:/Users/admin/Desktop/swp391/DichVuChuyenNha/uploads/damages/";

            // ✅ Tạo tên file duy nhất
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            // ✅ Đảm bảo thư mục tồn tại
            Path path = Paths.get(uploadDir + fileName);
            Files.createDirectories(path.getParent());

            // ✅ Lưu file xuống ổ cứng
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            // ✅ Tạo URL public trả lại frontend
            String imageUrl = "http://localhost:8080/images/damages/" + fileName;
            return ResponseEntity.ok(imageUrl);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload image");
        }
    }



}
//fix end
