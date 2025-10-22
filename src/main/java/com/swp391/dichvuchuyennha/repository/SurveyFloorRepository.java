package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import com.swp391.dichvuchuyennha.entity.Surveys;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyFloorRepository extends JpaRepository<SurveyFloor, Integer> {
    List<SurveyFloor> findBySurvey_SurveyId(Integer surveyId);

}
