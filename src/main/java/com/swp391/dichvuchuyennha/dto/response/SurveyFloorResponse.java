package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyFloorResponse {
    private Integer floorId;
    private Integer floorNumber;
    private Double area;
    private Integer numRooms;
    private List<SurveyImageResponse> images; // ảnh của tầng này

}
