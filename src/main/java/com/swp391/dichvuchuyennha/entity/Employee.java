package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "employee")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Integer employeeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(name = "position")
    private String position;

    @Column(name = "phone")
    private String phone;

    @Column(name = "status")
    private String status;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AssignmentEmployee> assignmentEmployees;

    @OneToMany(mappedBy = "responsibleEmployee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Damages> damages;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WorkProgress> workProgress;

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vehicles> vehicles;
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RequestAssignment> assignedRequests;



}
