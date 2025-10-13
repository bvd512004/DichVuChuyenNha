package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.request.SurveyRequest;
import com.swp391.dichvuchuyennha.dto.response.SurveyResponse;
import com.swp391.dichvuchuyennha.entity.Requests;
import com.swp391.dichvuchuyennha.entity.Surveys;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")


public interface SurveyMapper {
    @Mapping(target = "surveyId", ignore = true)
    @Mapping(target = "request", ignore = true)

    Surveys toEntity(SurveyRequest dto);


    @Mapping(target = "requestId",source = "request.requestId")

    @Mapping(target = "requestTime",source = "request.requestTime")
    @Mapping(target = "username", source = "request.user.username", defaultValue = "N/A")
    @Mapping(target = "companyName", source = "request.business.companyName", defaultValue = "N/A")
    SurveyResponse toResponse(Surveys survey);

}

