//package com.swp391.dichvuchuyennha.controller;
//
//import com.swp391.dichvuchuyennha.service.PayOSService;
//import com.swp391.dichvuchuyennha.service.PaymentService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@Slf4j
//@RestController
//@RequestMapping("/api/payments/webhook")
//@RequiredArgsConstructor
//public class PayOSWebhookController {
//
//    private final PayOSService payOSService;
//    private final PaymentService paymentService;
//
//    /**
//     * ✅ Xử lý webhook khi PayOS gửi kết quả thanh toán
//     */
//    @PostMapping
//    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
//        log.info("📩 Webhook received: {}", payload);
//
//        // 1️⃣ Xác minh chữ ký (checksum)
//        boolean valid = payOSService.verifyCallback(payload);
//        if (!valid) {
//            log.warn("❌ Invalid checksum from PayOS");
//            return ResponseEntity.badRequest().body("Invalid checksum");
//        }
//
//        try {
//            // 2️⃣ Lấy orderCode và cập nhật DB
//            String orderCode = payload.get("orderCode").toString();
//            paymentService.confirmDepositPayment(orderCode);
//
//            log.info("✅ Payment confirmed for order {}", orderCode);
//            return ResponseEntity.ok("Webhook processed successfully");
//
//        } catch (Exception e) {
//            log.error("❌ Error processing webhook: {}", e.getMessage());
//            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
//        }
//    }
//}
