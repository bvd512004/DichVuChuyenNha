package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;


    @PostMapping("/deposit/{contractId}")
    public String createDepositPayment(@PathVariable Integer contractId) {
        JSONObject response = paymentService.createDepositPayment(contractId);
        return response.toString();
    }
    /**
     * ✅ API tạo QR thanh toán phần còn lại (Final Payment)
     */
    @PostMapping("/final/{contractId}")
    public String createFinalPayment(@PathVariable Integer contractId) {
        JSONObject response = paymentService.createFinalPayment(contractId);
        return response.toString();
    }


    /**
     * ✅ API cho khách hàng xem thông tin thanh toán cuối cùng
     */
    @GetMapping("/final/{contractId}")
    public String getFinalPaymentInfo(@PathVariable Integer contractId) {
        JSONObject response = paymentService.getFinalPaymentInfo(contractId);
        return response.toString();
    }
    @GetMapping("/final/me")
    public String getFinalPaymentsForUser(@RequestHeader("Authorization") String authHeader) {
        JSONObject response = paymentService.getFinalPaymentsForUser(authHeader);
        return response.toString(); // ✅ Trả về String JSON thống nhất
    }

}
