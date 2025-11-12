package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    Optional<Payment> findTopByContractAndPaymentTypeOrderByPaymentDateDesc(Contract contract, String paymentType);
    Optional<Payment> findByOrderCode(Long orderCode);
    List<Payment> findByStatus(String status);
    // src/main/java/com/swp391/dichvuchuyennha/repository/PaymentRepository.java

    @Query("SELECT p FROM Payment p WHERE p.contract.contractId = :contractId AND p.paymentType = 'DEPOSIT'")
    List<Payment> findDepositsByContractId(Integer contractId);
// src/main/java/com/swp391/dichvuchuyennha/repository/PaymentRepository.java

    @Query("SELECT p FROM Payment p WHERE p.paymentType = :paymentType")
    List<Payment> findByPaymentType(@Param("paymentType") String paymentType);

}
