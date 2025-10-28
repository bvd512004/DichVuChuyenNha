package com.swp391.dichvuchuyennha.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swp391.dichvuchuyennha.dto.request.SurveyRequest;
import com.swp391.dichvuchuyennha.dto.response.SurveyResponse;
import com.swp391.dichvuchuyennha.entity.Surveys;
import com.swp391.dichvuchuyennha.mapper.SurveyMapper;
import com.swp391.dichvuchuyennha.service.SurveyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;
    private final SurveyMapper surveyMapper;

    // API tạo survey mới
    @PostMapping
    public ResponseEntity<SurveyResponse> createSurvey(@RequestBody SurveyRequest dto) {
        Surveys savedSurvey = surveyService.createSurvey(dto);
        return ResponseEntity.ok(surveyMapper.toResponse(savedSurvey));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SurveyResponse>> getMySurveys() {
        return ResponseEntity.ok(surveyService.getSurveysByCurrentEmployee());
    }
    @PutMapping("/{id}")
    public ResponseEntity<SurveyResponse> updateSurvey(@PathVariable Integer id,
                                                       @RequestBody SurveyRequest dto) {
        return ResponseEntity.ok(surveyService.updateSurvey(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSurvey(@PathVariable Integer id) {
        surveyService.deleteSurvey(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping
    public List<SurveyResponse> getAllSurveys() {
        return surveyService.getAllSurveys();
    }

}