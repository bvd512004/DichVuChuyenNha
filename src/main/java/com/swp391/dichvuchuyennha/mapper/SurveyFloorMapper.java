package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.request.SurveyFloorRequest;
import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface SurveyFloorMapper {
    SurveyFloor toEntity(SurveyFloorRequest request);

}
