package com.swp391.dichvuchuyennha.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.dichvuchuyennha.dto.request.AuthenticationRequest;
import com.swp391.dichvuchuyennha.dto.response.AuthenticationResponse;
import com.swp391.dichvuchuyennha.dto.response.UserResponse;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // inject bean từ config

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationSec}")
    private long jwtExpirationSec;

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();
    private final Map<String, Map<String, Object>> otpStore = new ConcurrentHashMap<>();
    private final EmailService emailService; // Inject EmailService

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated)
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        String token = generateToken(user);
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

    private String generateToken(Users user) {
        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(user.getUsername())
                    .issuer("moving-service.com")
                    .issueTime(new Date())
                    .expirationTime(Date.from(Instant.now().plusSeconds(jwtExpirationSec)))
                    .jwtID(UUID.randomUUID().toString())
                    .claim("roles", List.of(user.getRole().getRoleName()))
                    .claim("position", user.getEmployee() != null ? user.getEmployee().getPosition() : null)
                    .claim("userId", user.getUserId())
                    .build();

            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);
            SignedJWT signedJWT = new SignedJWT(header, claims);
            signedJWT.sign(new MACSigner(jwtSecret.getBytes()));

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Cannot create JWT token", e);
        }
    }

    /** Kiểm tra và parse token */
    public Users verifyAndParseToken(String token) {
        try {
            if (blacklistedTokens.contains(token)) {
                throw new AppException(ErrorCode.UNAUTHENTICATED); // token đã logout
            }

            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(jwtSecret.getBytes());

            boolean valid = signedJWT.verify(verifier);
            if (!valid)
                throw new AppException(ErrorCode.UNAUTHENTICATED);

            Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiry.before(new Date()))
                throw new AppException(ErrorCode.UNAUTHENTICATED);

            String username = signedJWT.getJWTClaimsSet().getSubject();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        } catch (ParseException | JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }

    /** Logout: đưa token vào blacklist */
    public void logout(String token) {
        blacklistedTokens.add(token);
    }

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

    // : Gửi OTP khi quên mật khẩu
    public void sendOtpForReset(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Generate OTP 6 chữ số
        String otp = String.format("%06d", new Random().nextInt(999999));
        long expiry = System.currentTimeMillis() + 300000; // 5 phút

        // Lưu vào store
        Map<String, Object> otpData = new HashMap<>();
        otpData.put("otp", otp);
        otpData.put("expiry", expiry);
        otpStore.put(email, otpData);

        // Gửi email
        emailService.sendOtpEmail(email, otp);
    }

    // : Verify OTP
    public boolean verifyOtp(String email, String otp) {
        Map<String, Object> otpData = otpStore.get(email);
        if (otpData == null)
            return false;

        String storedOtp = (String) otpData.get("otp");
        long expiry = (long) otpData.get("expiry");

        if (System.currentTimeMillis() > expiry) {
            otpStore.remove(email);
            return false;
        }

        boolean valid = storedOtp.equals(otp);
        if (valid)
            otpStore.remove(email); // Xóa sau khi verify thành công
        return valid;
    }

    // : Reset password sau khi verify OTP
    public void resetPassword(String email, String newPassword, String otp) {
        if (!verifyOtp(email, otp)) {
            throw new AppException(ErrorCode.INVALID_KEY); // OTP invalid or expired
        }

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

}
