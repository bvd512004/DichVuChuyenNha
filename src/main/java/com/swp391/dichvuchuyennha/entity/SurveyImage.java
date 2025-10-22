package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "survey_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SurveyImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer imageId;

    @ManyToOne
    @JoinColumn(name = "floor_id")
    private SurveyFloor floor;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note; // Ghi chú ảnh ví dụ: "Phòng khách, cần đóng gói đồ điện tử"
}
