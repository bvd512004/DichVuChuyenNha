package com.swp391.dichvuchuyennha.scheduler;

import com.swp391.dichvuchuyennha.entity.Payment;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentScheduler {

    private final PaymentRepository paymentRepository;
    private final ContractRepository contractRepository;

    /** ✅ Hủy hợp đồng chưa thanh toán khi quá hạn (chạy mỗi đêm 0h) */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cancelExpiredContracts() {
        LocalDate today = LocalDate.now();

        List<Payment> expired = paymentRepository.findByStatus("pending").stream()
                .filter(p -> p.getDueDate() != null && p.getDueDate().isBefore(today))
                .toList();

        for (Payment p : expired) {
            var contract = p.getContract();
            if (!"CANCELLED".equalsIgnoreCase(contract.getStatus())) {
                contract.setStatus("CANCELLED");
                p.setStatus("expired");
                contractRepository.save(contract);
                paymentRepository.save(p);
                log.warn("❌ Auto-cancel contract ID {} (due {}, unpaid)", contract.getContractId(), p.getDueDate());
            }
        }
    }
}
