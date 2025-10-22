package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "survey_floors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyFloor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer floorId;

    @ManyToOne
    @JoinColumn(name = "survey_id")
    private Surveys survey;

    @Column(name = "floor_number")
    private Integer floorNumber; // Tầng thứ mấy

    @Column(name = "area")
    private Double area; // Diện tích tầng

    @Column(name = "num_rooms")
    private Integer numRooms; // Số phòng tầng đó (có thể null nếu nhà riêng)

   // Nhân công cho tầng này

    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SurveyImage> images; // Ảnh và ghi chú tầng
}
