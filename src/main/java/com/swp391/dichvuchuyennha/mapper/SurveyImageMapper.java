package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.request.SurveyImageRequest;
import com.swp391.dichvuchuyennha.entity.SurveyImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SurveyImageMapper {
    @Mapping(target ="floor.floorId",source= "floorId")
    SurveyImage toEntity (SurveyImageRequest request);
}
