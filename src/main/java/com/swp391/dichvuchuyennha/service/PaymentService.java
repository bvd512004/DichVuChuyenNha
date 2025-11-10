package com.swp391.dichvuchuyennha.service;

import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Payment;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PayOSService payOSService;
    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;


    @Value("${jwt.secret}")
    private String jwtSecret;

    // Thêm phương thức này để xác thực JWT và lấy userId
    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String token = authHeader.substring(7);

        try {
            // Parse JWT token
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(jwtSecret.getBytes());

            boolean valid = signedJWT.verify(verifier);
            if (!valid) throw new AppException(ErrorCode.UNAUTHENTICATED);

            // Kiểm tra thời gian hết hạn của token
            Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiry.before(new Date())) throw new AppException(ErrorCode.UNAUTHENTICATED);

            // Lấy userId từ claims trong JWT
            return signedJWT.getJWTClaimsSet().getLongClaim("userId");

        } catch (ParseException | com.nimbusds.jose.JOSEException e) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }
    /**
     * ✅ ✅ ✅ FIXED - Lấy danh sách thanh toán cuối cho người dùng
     */
    public JSONObject getFinalPaymentsForUser(String authHeader) {
        // 1. Lấy userId từ token
        Long userId = extractUserIdFromToken(authHeader);

        // 2. ✅ Tìm tất cả contracts của customer này
        List<Contract> userContracts = contractRepository.findContractsByCustomerUserId(userId);

        // 3. ✅ Lấy tất cả final payments từ các contracts đó
        List<Payment> finalPayments = new ArrayList<>();
        for (Contract contract : userContracts) {
            Optional<Payment> paymentOpt = paymentRepository
                    .findTopByContractAndPaymentTypeOrderByPaymentDateDesc(contract, "final");
            paymentOpt.ifPresent(finalPayments::add);
        }

        // 4. ✅ Convert sang JSON array
        org.json.JSONArray paymentsArray = new org.json.JSONArray();
        for (Payment payment : finalPayments) {
            JSONObject paymentJson = new JSONObject();
            paymentJson.put("paymentId", payment.getPaymentId());
            paymentJson.put("orderCode", payment.getOrderCode());
            paymentJson.put("amount", payment.getAmount());
            paymentJson.put("status", payment.getStatus());
            paymentJson.put("method", payment.getMethod());
            paymentJson.put("checkoutUrl", payment.getCheckoutUrl());
            paymentJson.put("dueDate", payment.getDueDate() != null ? payment.getDueDate().toString() : null);
            paymentJson.put("paymentDate", payment.getPaymentDate() != null ? payment.getPaymentDate().toString() : null);
            paymentJson.put("contractId", payment.getContract().getContractId());
            paymentsArray.put(paymentJson);
        }

        // 5. ✅ Trả về đúng format
        JSONObject result = new JSONObject();
        result.put("success", true);
        result.put("userId", userId);
        result.put("payments", paymentsArray);

        return result;
    }

    /** ✅ Tạo yêu cầu thanh toán đặt cọc */
    public JSONObject createDepositPayment(Integer contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        // Kiểm tra xem thanh toán đã tồn tại chưa
        Optional<Payment> existingPayment = paymentRepository
                .findTopByContractAndPaymentTypeOrderByPaymentDateDesc(contract, "deposit");
        if (existingPayment.isPresent() && "pending".equalsIgnoreCase(existingPayment.get().getStatus())) {
            throw new RuntimeException("Đơn thanh toán đặt cọc đã tồn tại!");
        }

        // Tạo orderCode và mô tả (✅ ngắn gọn)
        String orderCode = "HD" + contract.getContractId() + "-DEPOSIT";
        String description = "Dat coc HD" + contract.getContractId(); // ✅ <= 25 ký tự

        // Gửi yêu cầu thanh toán đến PayOS
        JSONObject payosResponse = payOSService.createPayment(
                contract.getDepositAmount(),
                orderCode,
                description,
                "http://localhost:5173/payment/success",
                "http://localhost:5173/payment/cancel"
        );

        // ✅ Kiểm tra response từ PayOS
        if (!payosResponse.has("code") || !"00".equals(payosResponse.getString("code"))) {
            throw new RuntimeException("PayOS error: " + payosResponse.optString("desc", "Unknown error"));
        }

        // Tính deposit_due_date
        LocalDate movingDay = contract.getQuotation()
                .getSurvey()
                .getRequest()
                .getMovingDay()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
        LocalDate depositDueDate = movingDay.minusDays(1);
        contract.setDepositDueDate(depositDueDate);
        contractRepository.save(contract);

        // ✅ Lấy data từ PayOS response
        JSONObject payosData = payosResponse.getJSONObject("data");
        String checkoutUrl = payosData.getString("checkoutUrl");
        Long orderCodeValue = payosData.getLong("orderCode");

        // Lưu payment vào DB
        Payment payment = new Payment();
        payment.setContract(contract);
        payment.setAmount(contract.getDepositAmount());
        payment.setPaymentDate(LocalDate.now());
        payment.setDueDate(depositDueDate);
        payment.setMethod("PayOS");
        payment.setStatus("pending");
        payment.setPaymentType("deposit");
        payment.setCheckoutUrl(checkoutUrl);
        payment.setOrderCode(orderCodeValue);
        paymentRepository.save(payment);

        // ✅ Trả về format chuẩn cho frontend
        JSONObject result = new JSONObject();
        result.put("success", true);
        result.put("checkoutUrl", checkoutUrl);
        result.put("qrCode", payosData.optString("qrCode", ""));
        result.put("paymentLinkId", payosData.optString("paymentLinkId", ""));
        result.put("orderCode", orderCodeValue);
        result.put("amount", contract.getDepositAmount());

        return result;
    }


    /** ✅ Xác nhận thanh toán thành công */
    public void confirmDepositPayment(String orderCode) {
        String contractIdStr = orderCode.split("-")[0].replace("HD", "");
        Integer contractId = Integer.parseInt(contractIdStr);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        Payment payment = paymentRepository.findTopByContractAndPaymentTypeOrderByPaymentDateDesc(contract, "deposit")
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus("paid");
        payment.setPaymentDate(LocalDate.now());
        paymentRepository.save(payment);

        // ✅ Chỉ mới thanh toán đặt cọc → cập nhật trạng thái phù hợp
        contract.setStatus("DEPOSIT_PAID");
        contractRepository.save(contract);
    }
    /** ✅ Tạo QR cho thanh toán phần còn lại (Final Payment) */
    public JSONObject createFinalPayment(Integer contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        // ✅ Chỉ cho phép khi hợp đồng đã DEPOSIT_PAID và toàn bộ workprogress đã completed
        if (!"DEPOSIT_PAID".equalsIgnoreCase(contract.getStatus())) {
            throw new RuntimeException("Contract must be in DEPOSIT_PAID status to finalize payment");
        }

        // ✅ Kiểm tra nếu đã có payment final đang pending
        Optional<Payment> existingPayment = paymentRepository
                .findTopByContractAndPaymentTypeOrderByPaymentDateDesc(contract, "final");
        if (existingPayment.isPresent() && "pending".equalsIgnoreCase(existingPayment.get().getStatus())) {
            throw new RuntimeException("Đơn thanh toán cuối cùng đã tồn tại!");
        }

        // ✅ Tính số tiền còn lại (Total - Deposit - Damage nếu có)
        double totalAmount = contract.getTotalAmount();
        double deposit = contract.getDepositAmount();
        double damageCost = contract.getDamages() != null
                ? contract.getDamages().stream()
                .filter(d -> d.getCost() != null)
                .mapToDouble(d -> d.getCost().doubleValue())
                .sum()
                : 0.0;

        double remainingAmount = totalAmount - deposit - damageCost;
        if (remainingAmount <= 0) {
            throw new RuntimeException("No remaining amount to pay.");
        }

        // ✅ Tạo order code và mô tả
        String orderCode = String.valueOf(100000 + contract.getContractId()); // ví dụ: 100012
        String description = "FinalPayHD" + contract.getContractId();



        // ✅ Gửi yêu cầu thanh toán đến PayOS
        JSONObject payosResponse = payOSService.createPayment(
                remainingAmount,
                orderCode,
                description,
                "http://localhost:5173/payment/final/success",
                "http://localhost:5173/payment/final/cancel"
        );

        // ✅ Kiểm tra phản hồi từ PayOS
        if (!payosResponse.has("code") || !"00".equals(payosResponse.getString("code"))) {
            throw new RuntimeException("PayOS error: " + payosResponse.optString("desc", "Unknown error"));
        }

        JSONObject payosData = payosResponse.getJSONObject("data");
        String checkoutUrl = payosData.getString("checkoutUrl");
        Long orderCodeValue = payosData.getLong("orderCode");

        // ✅ Tạo bản ghi Payment
        Payment payment = new Payment();
        payment.setContract(contract);
        payment.setAmount(remainingAmount);
        payment.setPaymentDate(LocalDate.now());
        payment.setDueDate(LocalDate.now().plusDays(3)); // cho hạn 3 ngày thanh toán
        payment.setMethod("PayOS");
        payment.setStatus("pending");
        payment.setPaymentType("final");
        payment.setCheckoutUrl(checkoutUrl);
        payment.setOrderCode(orderCodeValue);
        paymentRepository.save(payment);

        // ✅ Cập nhật trạng thái hợp đồng
        contract.setStatus("FINAL_PENDING");
        contractRepository.save(contract);

        // ✅ Trả về dữ liệu cho frontend
        JSONObject result = new JSONObject();
        result.put("success", true);
        result.put("checkoutUrl", checkoutUrl);
        result.put("qrCode", payosData.optString("qrCode", ""));
        result.put("paymentLinkId", payosData.optString("paymentLinkId", ""));
        result.put("orderCode", orderCodeValue);
        result.put("amount", remainingAmount);

        return result;
    }

    /** ✅ Lấy thông tin thanh toán cuối (cho khách hàng xem QR) */
    public JSONObject getFinalPaymentInfo(Integer contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        Optional<Payment> paymentOpt = paymentRepository
                .findTopByContractAndPaymentTypeOrderByPaymentDateDesc(contract, "final");

        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("No final payment found for this contract.");
        }

        Payment payment = paymentOpt.get();

        JSONObject result = new JSONObject();
        result.put("checkoutUrl", payment.getCheckoutUrl());
        result.put("amount", payment.getAmount());
        result.put("status", payment.getStatus());
        result.put("orderCode", payment.getOrderCode());
        result.put("paymentType", payment.getPaymentType());
        result.put("dueDate", payment.getDueDate());
        return result;
    }

}
