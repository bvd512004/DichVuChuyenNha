package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoices {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Thêm auto increment
    @Column(name = "invoice_id")
    private Integer invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @Column(name = "invoice_date", nullable = false)
    private LocalDateTime invoiceDate = LocalDateTime.now();

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "type", nullable = false)
    private String type; // "deposit" hoặc "final"

    @Column(name = "vat_number", length = 50)
    private String vatNumber;
}
