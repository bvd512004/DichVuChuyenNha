package com.swp391.dichvuchuyennha.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.swp391.dichvuchuyennha.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByContract_ContractIdIn(List<Integer> contractIds);
}