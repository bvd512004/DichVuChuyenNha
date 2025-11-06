package com.swp391.dichvuchuyennha.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageAnalysisResponse {
    private Double estimatedArea; // Diện tích ước tính (m²)
    private List<DetectedFurniture> detectedFurniture; // Danh sách đồ đạc được phát hiện
    private String analysisNote; // Ghi chú từ AI
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetectedFurniture {
        private String name; // Tên đồ đạc (ví dụ: "bàn", "ghế", "giường", "tủ")
        private Integer quantity; // Số lượng
        private String description; // Mô tả chi tiết
        private Integer suggestedServiceId; // ID dịch vụ được đề xuất (nếu có)
        private String suggestedServiceName; // Tên dịch vụ được đề xuất
        private Integer suggestedPriceId; // ID giá được đề xuất (nếu có)
        private String priceType; // Loại giá (Theo chiếc - Bàn, Theo chiếc - Ghế, v.v.)
    }
}

