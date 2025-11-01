package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "assignment_employee")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentEmployee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Column(name = "assigned_time")
    private LocalDate assignedTime;

    @Column(name = "assign_date") // Thêm trường assign_date để lưu ngày gán
    private LocalDate assignDate;  // Lưu ngày vận chuyển (moving_day) khi gán nhân viên
}
//end
