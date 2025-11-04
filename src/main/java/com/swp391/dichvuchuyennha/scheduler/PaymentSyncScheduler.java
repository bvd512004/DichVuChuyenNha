package com.swp391.dichvuchuyennha.scheduler;

import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Payment;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.PaymentRepository;
import com.swp391.dichvuchuyennha.service.PayOSService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentSyncScheduler {

    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;
    private final PayOSService payOSService;

    /**
     * ✅ Tự động sync payment status từ PayOS
     * Chạy mỗi 10 giây, chỉ check các payment pending trong 7 ngày gần đây
     */
    @Scheduled(fixedRate = 10000) // 10 giây
    @Transactional
    public void syncPendingPaymentsFromPayOS() {
        try {
            // 1️⃣ Lấy tất cả payment đang pending trong 7 ngày gần đây
            LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
            List<Payment> pendingPayments = paymentRepository.findByStatus("pending")
                    .stream()
                    .filter(p -> p.getPaymentDate().isAfter(sevenDaysAgo))
                    .toList();

            if (pendingPayments.isEmpty()) {
                return; // Không có payment nào cần sync
            }

            log.info("🔄 Syncing {} pending payments from PayOS...", pendingPayments.size());

            for (Payment payment : pendingPayments) {
                try {
                    // 2️⃣ Gọi PayOS API để kiểm tra trạng thái thanh toán
                    JSONObject payosResponse = payOSService.getPaymentStatus(payment.getOrderCode());

                    if (!payosResponse.has("code")) {
                        log.warn("⚠️ Invalid PayOS response for orderCode: {}", payment.getOrderCode());
                        continue;
                    }

                    String responseCode = payosResponse.getString("code");
                    if (!"00".equals(responseCode)) {
                        log.debug("⚠️ PayOS error for orderCode {}: {}",
                                payment.getOrderCode(),
                                payosResponse.optString("desc", "Unknown error"));
                        continue;
                    }

                    JSONObject data = payosResponse.getJSONObject("data");
                    String payosStatus = data.getString("status");

                    log.info("📦 OrderCode {}: Current DB status = {}, PayOS status = {}",
                            payment.getOrderCode(), payment.getStatus(), payosStatus);

                    Contract contract = payment.getContract();

                    // 3️⃣ Nếu PayOS báo PAID → cập nhật DB
                    if ("PAID".equalsIgnoreCase(payosStatus)) {
                        payment.setStatus("paid");
                        payment.setPaymentDate(LocalDate.now());
                        paymentRepository.save(payment);

                        // ✅ Cập nhật trạng thái hợp đồng dựa theo loại thanh toán
                        if ("deposit".equalsIgnoreCase(payment.getPaymentType())) {
                            contract.setStatus("DEPOSIT_PAID");
                            log.info("💰 Contract {} updated → DEPOSIT_PAID (deposit payment confirmed)", contract.getContractId());
                        } else if ("final".equalsIgnoreCase(payment.getPaymentType())) {
                            contract.setStatus("FINAL_COMPLETED");
                            log.info("🎯 Contract {} updated → FINAL_COMPLETED (final payment confirmed)", contract.getContractId());
                        }

                        contractRepository.save(contract);
                        log.info("✅ Payment {} synced successfully → PAID", payment.getOrderCode());
                    }

                    // 4️⃣ Nếu PayOS báo CANCELLED → cập nhật trạng thái
                    else if ("CANCELLED".equalsIgnoreCase(payosStatus)) {
                        payment.setStatus("cancelled");
                        paymentRepository.save(payment);
                        log.info("⚠️ Payment {} → CANCELLED", payment.getOrderCode());
                    }

                } catch (Exception e) {
                    log.error("❌ Error syncing payment orderCode {}: {}", payment.getOrderCode(), e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("❌ Error in syncPendingPaymentsFromPayOS scheduler", e);
        }
    }
}
