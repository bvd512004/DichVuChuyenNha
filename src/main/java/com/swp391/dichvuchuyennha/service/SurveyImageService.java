package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.SurveyImageRequest;
import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import com.swp391.dichvuchuyennha.entity.SurveyImage;
import com.swp391.dichvuchuyennha.mapper.SurveyImageMapper;
import com.swp391.dichvuchuyennha.repository.SurveyFloorRepository;
import com.swp391.dichvuchuyennha.repository.SurveyImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SurveyImageService {

    private final SurveyImageRepository surveyImageRepository;
    private final SurveyImageMapper surveyImageMapper;
    private final SurveyFloorRepository surveyFloorRepository;

    // Tạo ảnh mới cho tầng khảo sát
    public SurveyImage createSurveyImage(SurveyImageRequest request) {
        SurveyFloor floor = surveyFloorRepository.findById(request.getFloorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tầng khảo sát với ID: " + request.getFloorId()));

        SurveyImage image = surveyImageMapper.toEntity(request);
        image.setFloor(floor);
        return surveyImageRepository.save(image);
    }

    // Lấy tất cả ảnh của 1 tầng
    public List<SurveyImage> getImagesByFloorId(Integer floorId) {
        return surveyImageRepository.findByFloor_FloorId(floorId);
    }

    // Xóa 1 ảnh
    public void deleteImage(Integer imageId) {
        if (!surveyImageRepository.existsById(imageId)) {
            throw new RuntimeException("Không tìm thấy ảnh với ID: " + imageId);
        }
        surveyImageRepository.deleteById(imageId);
    }
}
