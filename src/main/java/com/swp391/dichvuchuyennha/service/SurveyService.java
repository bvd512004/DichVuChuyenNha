package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.SurveyRequest;
import com.swp391.dichvuchuyennha.dto.response.SurveyResponse;
import com.swp391.dichvuchuyennha.entity.Requests;
import com.swp391.dichvuchuyennha.entity.Surveys;
import com.swp391.dichvuchuyennha.external.DistanceCalculator;
import com.swp391.dichvuchuyennha.mapper.SurveyMapper;
import com.swp391.dichvuchuyennha.repository.RequestRepository;
import com.swp391.dichvuchuyennha.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SurveyService {
    private final SurveyMapper surveyMapper;
    private final SurveyRepository surveyRepository;
    private final RequestRepository requestRepository;

    public Surveys createSurvey(SurveyRequest dto) {
        Surveys survey = surveyMapper.toEntity(dto);

        Requests request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Request không tồn tại"));

        survey.setRequest(request);
        // Có thể set mặc định status nếu muốn
        if (survey.getStatus() == null) {
            survey.setStatus("Pending");
        }



        return surveyRepository.save(survey);
    }
    public List<SurveyResponse> getAllSurveys() {
        List<Surveys> surveys = surveyRepository.findAll();
        return surveys.stream()
                .map(surveyMapper::toResponse)
                .collect(Collectors.toList());
    }
    public SurveyResponse updateSurvey(Integer id, SurveyRequest dto) {
        Surveys survey = surveyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Survey not found"));

        // update fields
        survey.setSurveyDate(dto.getSurveyDate());
        survey.setAddressFrom(dto.getAddressFrom());
        survey.setAddressTo(dto.getAddressTo());
        survey.setStatus(dto.getStatus());
        survey.setEstimatedWorkers(dto.getEstimatedWorkers());

        return surveyMapper.toResponse(surveyRepository.save(survey));
    }

    public void deleteSurvey(Integer id) {
        if (!surveyRepository.existsById(id)) {
            throw new RuntimeException("Survey not found");
        }
        surveyRepository.deleteById(id);
    }
}
