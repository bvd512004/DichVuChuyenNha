package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "surveys")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Surveys {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer surveyId;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private Requests request;

    @Column(name = "survey_date")
    private LocalDateTime surveyDate;

 // 'HOUSE' hoặc 'COMPANY'

    @Column(name = "total_area")
    private Double totalArea; // Tổng diện tích tất cả tầng

    @Column(name = "num_floors")
    private Integer numFloors; // Số tầng (nhà riêng)

    @Column(name = "num_rooms")
    private Integer numRooms; // Số phòng (công ty / văn phòng)

    @Column(name = "distance_km")
    private Double distanceKm; // Khoảng cách vận chuyển (km)

    @Column(name = "estimate_worker")
    private  Integer estimateWorkers; // Danh sách dịch vụ bổ sung

    @Column(name = "note", columnDefinition = "TEXT")
    private String note; // Ghi chú chung

    @Column(name = "list_services", columnDefinition = "TEXT")
    private String listService; // Danh sách dịch vụ bổ sung

    @Column(name = "status")
    private String status; // Trạng thái khảo sát (PENDING, DONE,...)

    @OneToMany(mappedBy = "survey", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SurveyFloor> floors; // Danh sách các tầng
}

