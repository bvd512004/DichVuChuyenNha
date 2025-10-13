package com.swp391.dichvuchuyennha.controller;

import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.service.WorkProgressCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/customer/work-progress")
@RequiredArgsConstructor
public class WorkProgressCustomerController {

    private final WorkProgressCustomerService workProgressCustomerService;

    @Value("${jwt.secret}")//ssua
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

    /**
     * 📦 Lấy tất cả tiến độ của khách hàng đang đăng nhập
     */
    @GetMapping
    public ResponseEntity<List<WorkProgressResponse>> getAllWorkProgressForCustomer(
            @RequestHeader("Authorization") String authHeader) {

        Long userId = extractUserIdFromToken(authHeader);
        return ResponseEntity.ok(workProgressCustomerService.getWorkProgressForCustomer(userId.intValue()));
    }

    /**
     * 📦 Lấy tiến độ theo contractId (kiểm tra quyền sở hữu hợp đồng)
     */
    @GetMapping("/{contractId}")
    public ResponseEntity<List<WorkProgressResponse>> getWorkProgressByContract(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer contractId) {

        Long userId = extractUserIdFromToken(authHeader);
        return ResponseEntity.ok(workProgressCustomerService.getWorkProgressByContract(userId.intValue(), contractId));
    }
}
