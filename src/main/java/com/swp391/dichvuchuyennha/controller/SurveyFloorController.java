package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.SurveyFloorRequest;
import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import com.swp391.dichvuchuyennha.service.SurveyFloorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/survey-floors")
@RequiredArgsConstructor
public class SurveyFloorController {

    private final SurveyFloorService surveyFloorService;


    @PostMapping
    public ResponseEntity<SurveyFloor> createSurveyFloor(@RequestBody SurveyFloorRequest request) {
        SurveyFloor created = surveyFloorService.createSurveyFloor(request);
        return ResponseEntity.ok(created);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSurveyFloor(@PathVariable Integer id) {
        surveyFloorService.deleteSurveyFloor(id);
        return ResponseEntity.noContent().build();
    }
}
