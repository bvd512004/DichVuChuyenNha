package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "damages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Damages {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "damage_id")
    private Integer damageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Column(name = "cause")
    private String cause;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsible_employee_id")
    private Employee responsibleEmployee;

    @Column(name = "cost")
    private Double cost;

    @Column(name = "status")
    private String status;
    @Column(name = "image_url")
    private String imageUrl; // ảnh minh chứng thiệt hại

    @Column(name = "customer_feedback")
    private String customerFeedback; // lý do từ chối của khách

    @Column(name = "manager_feedback")
    private String managerFeedback; // Feedback từ quản lý
}
