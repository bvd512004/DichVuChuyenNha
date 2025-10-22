package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import com.swp391.dichvuchuyennha.entity.SurveyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyImageRepository extends JpaRepository<SurveyImage, Integer> {
    List<SurveyImage> findByFloor_FloorId(Integer floorId);

}
