package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.SurveyFloorRequest;
import com.swp391.dichvuchuyennha.entity.Surveys;
import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import com.swp391.dichvuchuyennha.entity.Surveys;
import com.swp391.dichvuchuyennha.mapper.SurveyFloorMapper;
import com.swp391.dichvuchuyennha.repository.SurveyFloorRepository;
import com.swp391.dichvuchuyennha.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SurveyFloorService {

    private final SurveyFloorRepository surveyFloorRepository;
    private final SurveyRepository surveyRepository;
    @Autowired
    private final SurveyFloorMapper surveyFloorMapper;

    @Transactional
    public SurveyFloor createSurveyFloor(SurveyFloorRequest request) {
        // Chuyển DTO thành entity
        SurveyFloor surveyFloor = surveyFloorMapper.toEntity(request);

        // Lấy survey liên quan
        Surveys survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Survey not found with id: " + request.getSurveyId()));

        // Gán survey cho floor
        surveyFloor.setSurvey(survey);

        // Lưu tầng mới
        SurveyFloor saved = surveyFloorRepository.save(surveyFloor);

        // Cập nhật lại tổng diện tích cho survey
        updateSurveyTotalArea(survey);

        return saved;
    }


    public void deleteSurveyFloor(Integer id) {
        SurveyFloor floor = surveyFloorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SurveyFloor not found"));
        Surveys survey = floor.getSurvey();

        surveyFloorRepository.delete(floor);

        // Cập nhật lại tổng diện tích sau khi xóa tầng
        updateSurveyTotalArea(survey);
    }

    private void updateSurveyTotalArea(Surveys survey) {
        List<SurveyFloor> floors = surveyFloorRepository.findBySurvey_SurveyId(survey.getSurveyId());
        double totalArea = floors.stream()
                .mapToDouble(f -> f.getArea() != null ? f.getArea() : 0)
                .sum();
        survey.setTotalArea(totalArea);
        surveyRepository.save(survey);
    }
}
