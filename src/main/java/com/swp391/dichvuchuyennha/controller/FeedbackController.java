package com.swp391.dichvuchuyennha.controller;

import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.dichvuchuyennha.dto.request.FeedbackRequest;
import com.swp391.dichvuchuyennha.dto.response.FeedbackResponse;
import com.swp391.dichvuchuyennha.entity.CustomerCompany;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.repository.CustomerCompanyRepository;
import com.swp391.dichvuchuyennha.repository.FeedbackRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final CustomerCompanyRepository customerCompanyRepository; // Inject repository

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

    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody FeedbackRequest feedbackRequest) {

        Long userId = extractUserIdFromToken(authHeader); // Lấy userId từ token
        System.out.println("User ID từ token: " + userId); // Debug log
        // ✅ Convert Long -> Integer
        Integer userIdInt = userId.intValue();

        // ✅ Truy vấn với Integer
        CustomerCompany customerCompany = customerCompanyRepository.findByUser_UserId(userIdInt)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Integer userIdFromCompany = customerCompany.getUser().getUserId();

        // Gọi service
        FeedbackResponse response = feedbackService.submitFeedback(feedbackRequest, userIdFromCompany);

        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        List<FeedbackResponse> feedbacks = feedbackService.getAllFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }
}
