package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Entity
@Table(name = "contract")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Integer contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id")
    private Quotations quotation;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "deposit_amount")
    private Double depositAmount;

    @Column(name = "total_amount")
    private Double totalAmount;

    @Column(name = "status")
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signed_by")
    private Users signedBy;

    @Column(name = "signed_date")
    private LocalDateTime signedDate;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AssignmentEmployee> assignmentEmployees;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Invoices> invoices;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Damages> damages;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Feedbacks> feedbacks;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WorkProgress> workProgress;
    public LocalDate getMovingDay() {
        if (this.quotation == null
                || this.quotation.getRequest() == null
                || this.quotation.getRequest().getMovingDay() == null) {
            return null; // tránh NullPointerException
        }

        return this.quotation.getRequest().getMovingDay()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }


}
