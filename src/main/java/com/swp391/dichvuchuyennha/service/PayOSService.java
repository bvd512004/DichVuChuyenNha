package com.swp391.dichvuchuyennha.service;

import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Service
public class PayOSService {

    @Value("${payos.clientId}")
    private String clientId;

    @Value("${payos.apiKey}")
    private String apiKey;

    @Value("${payos.checksumKey}") // ✅ Thêm checksumKey
    private String checksumKey;

    @Value("${payos.api-url}")
    private String payosApiUrl;

    /**
     * ✅ Tạo yêu cầu thanh toán với signature
     */
    public JSONObject createPayment(double amount, String orderCode, String description,
                                    String returnUrl, String cancelUrl) {
        try {
            int intAmount = (int) amount;
            long orderCodeNumber = Long.parseLong(orderCode.replaceAll("\\D", ""));
            if (description.length() > 25) {
                description = description.substring(0, 25);
            }
            // ✅ Tính signature
            String signature = generateSignature(orderCodeNumber, intAmount, description,
                    cancelUrl, returnUrl);

            // ✅ Tạo request body
            JSONObject body = new JSONObject();
            body.put("orderCode", orderCodeNumber);
            body.put("amount", intAmount);
            body.put("description", description);
            body.put("returnUrl", returnUrl);
            body.put("cancelUrl", cancelUrl);
            body.put("signature", signature); // ✅ Thêm signature vào body

            // ✅ Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);
            RestTemplate restTemplate = new RestTemplate();

            log.info("📤 Request to PayOS: {}", body.toString(2));

            ResponseEntity<String> response = restTemplate.postForEntity(payosApiUrl, entity, String.class);
            log.info("✅ PayOS response: {}", response.getBody());

            return new JSONObject(response.getBody());

        } catch (Exception e) {
            log.error("❌ Lỗi tạo yêu cầu thanh toán PayOS", e);
            JSONObject error = new JSONObject();
            error.put("error", e.getMessage());
            return error;
        }
    }
    /**
     * ✅ NEW: Query PayOS API để check payment status
     */
    public JSONObject getPaymentStatus(Long orderCode) {
        try {
            // PayOS API: GET /v2/payment-requests/{orderCode}
            String url = payosApiUrl + "/" + orderCode;

            log.info("🔍 Querying PayOS status for orderCode: {}", orderCode);

            HttpHeaders headers = new HttpHeaders();
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            log.info("✅ PayOS status response: {}", response.getBody());

            return new JSONObject(response.getBody());

        } catch (Exception e) {
            log.error("❌ Error querying PayOS status for orderCode: {}", orderCode, e);
            JSONObject error = new JSONObject();
            error.put("error", e.getMessage());
            error.put("code", "ERROR");
            return error;
        }
    }

    /**
     * ✅ Tạo HMAC-SHA256 signature
     */
    private String generateSignature(long orderCode, int amount, String description,
                                     String cancelUrl, String returnUrl) throws Exception {
        // Thứ tự theo docs PayOS
        String data = String.format("amount=%d&cancelUrl=%s&description=%s&orderCode=%d&returnUrl=%s",
                amount, cancelUrl, description, orderCode, returnUrl);

        log.info("🔐 Signature data: {}", data);

        Mac sha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(
                checksumKey.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );
        sha256.init(secretKey);

        byte[] hash = sha256.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }

        return hexString.toString();
    }

    /**
     * ✅ Verify callback từ PayOS
     */
    public boolean verifyCallback(Map<String, Object> payload) {
        try {
            String code = (String) payload.get("code");
            return "00".equals(code);
        } catch (Exception e) {
            log.error("❌ Error verifying PayOS callback", e);
            return false;
        }
    }
}