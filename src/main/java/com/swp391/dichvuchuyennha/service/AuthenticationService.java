package com.swp391.dichvuchuyennha.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.dichvuchuyennha.dto.request.AuthenticationRequest;
import com.swp391.dichvuchuyennha.dto.response.AuthenticationResponse;
import com.swp391.dichvuchuyennha.dto.response.UserResponse;
import com.swp391.dichvuchuyennha.entity.AuditLog;
import com.swp391.dichvuchuyennha.entity.LoginHistory;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.repository.AuditLogRepository;
import com.swp391.dichvuchuyennha.repository.LoginHistoryRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationSec}")
    private long jwtExpirationSec;

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    private final Map<String, Map<String, Object>> otpStore = new ConcurrentHashMap<>();

    // LẤY IP AN TOÀN
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                var request = attributes.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("X-Real-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                return ip != null ? ip.split(",")[0].trim() : "unknown";
            }
        } catch (Exception e) {
            // ignore
        }
        return "unknown";
    }

    // LẤY USER-AGENT AN TOÀN
    private String getUserAgent() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                String ua = attributes.getRequest().getHeader("User-Agent");
                return ua != null ? ua.length() > 500 ? ua.substring(0, 500) : ua : "unknown";
            }
        } catch (Exception e) {
            // ignore
        }
        return "unknown";
    }

    // === LOGIN CHÍNH ===
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseGet(() -> userRepository.findByUsername(request.getEmail()) // fallback username nếu email fail
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            saveFailedLogin(user);
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Check role null
        if (user.getRole() == null) {
            throw new AppException(ErrorCode.ROLE_NOT_ASSIGNED); // Thêm ErrorCode mới nếu cần
        }

        String token = generateToken(user);

        // GHI LOGIN THÀNH CÔNG
        LoginHistory history = new LoginHistory();
        history.setUser(user);
        history.setLoginTime(LocalDateTime.now());
        history.setIpAddress(getClientIp());
        history.setUserAgent(getUserAgent());
        history.setStatus("SUCCESS");
        loginHistoryRepository.save(history);

        // GHI AUDIT LOG
        AuditLog auditLog = new AuditLog();
        auditLog.setUser(user);
        auditLog.setAction("LOGIN");
        auditLog.setEntity("USER");
        auditLog.setEntityId(user.getUserId());
        auditLog.setDetails("User logged in: " + user.getUsername());
        auditLog.setIpAddress(getClientIp());
        auditLogRepository.save(auditLog);

        return AuthenticationResponse.builder()
                .token(token)
                .authenticated(true)
                .userId(user.getUserId())
                .username(user.getUsername())
                .roleId(user.getRole().getRoleId())
                .roleName(user.getRole().getRoleName())
                .position(user.getEmployee() != null ? user.getEmployee().getPosition() : null)
                .build();
    }

    // GHI LỖI LOGIN (TÙY CHỌN)
    private void saveFailedLogin(Users user) {
        LoginHistory history = new LoginHistory();
        history.setUser(user);
        history.setLoginTime(LocalDateTime.now());
        history.setIpAddress(getClientIp());
        history.setUserAgent(getUserAgent());
        history.setStatus("FAILED");
        loginHistoryRepository.save(history);
    }

    // === GENERATE JWT ===
    private String generateToken(Users user) {
        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(user.getUsername())
                    .issuer("moving-service.com")
                    .issueTime(new Date())
                    .expirationTime(Date.from(Instant.now().plusSeconds(jwtExpirationSec)))
                    .jwtID(UUID.randomUUID().toString())
                    .claim("roles", List.of(user.getRole().getRoleName().toUpperCase()))
                    .claim("position", user.getEmployee() != null ? user.getEmployee().getPosition() : null)
                    .claim("userId", user.getUserId())
                    .build();

            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
            SignedJWT signedJWT = new SignedJWT(header, claims);
            signedJWT.sign(new MACSigner(jwtSecret.getBytes()));
            return signedJWT.serialize();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Cannot create JWT token", e);
        }
    }

    // === VERIFY TOKEN ===
    public Users verifyAndParseToken(String token) {
        try {
            if (blacklistedTokens.contains(token)) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(jwtSecret.getBytes());

            if (!signedJWT.verify(verifier)) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiry.before(new Date())) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            String username = signedJWT.getJWTClaimsSet().getSubject();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    // === LOGOUT ===
    public void logout(String token) {
        blacklistedTokens.add(token);
    }

    // === GET USER FROM TOKEN ===
    public UserResponse getUserFromToken(String token) {
        Users user = verifyAndParseToken(token);
        return UserResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roleName(user.getRole().getRoleName())
                .build();
    }

    // === OTP METHODS (giữ nguyên) ===
    public void sendOtpForReset(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String otp = String.format("%06d", new Random().nextInt(999999));
        long expiry = System.currentTimeMillis() + 300_000;

        Map<String, Object> otpData = new HashMap<>();
        otpData.put("otp", otp);
        otpData.put("expiry", expiry);
        otpStore.put(email, otpData);

        emailService.sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(String email, String otp) {
        Map<String, Object> otpData = otpStore.get(email);
        if (otpData == null) return false;

        String storedOtp = (String) otpData.get("otp");
        long expiry = (long) otpData.get("expiry");

        if (System.currentTimeMillis() > expiry) {
            otpStore.remove(email);
            return false;
        }

        boolean valid = storedOtp.equals(otp);
        if (valid) otpStore.remove(email);
        return valid;
    }

    public void resetPassword(String email, String newPassword, String otp) {
        if (!verifyOtp(email, otp)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}