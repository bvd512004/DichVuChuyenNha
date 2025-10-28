package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "assignment_vehicle")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentVehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicles vehicle;

    @Column(name = "assigned_time")
    private LocalDate assignedTime;

    @Column(name = "assign_date") // Ngày vận chuyển (moving_day)
    private LocalDate assignDate;
}

