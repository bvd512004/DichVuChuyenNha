package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.request.SurveyRequest;
import com.swp391.dichvuchuyennha.dto.response.SurveyFloorResponse;
import com.swp391.dichvuchuyennha.dto.response.SurveyImageResponse;
import com.swp391.dichvuchuyennha.dto.response.SurveyResponse;
import com.swp391.dichvuchuyennha.entity.Requests;
import com.swp391.dichvuchuyennha.entity.SurveyFloor;
import com.swp391.dichvuchuyennha.entity.SurveyImage;
import com.swp391.dichvuchuyennha.entity.Surveys;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")


public interface SurveyMapper {
    @Mapping(target = "surveyId", ignore = true)
    @Mapping(target = "request", ignore = true)

    Surveys toEntity(SurveyRequest dto);


    @Mapping(target = "requestId",source = "request.requestId")

    @Mapping(target = "requestTime",source = "request.requestTime")
    @Mapping(target = "username", source = "request.user.username", defaultValue = "N/A")
    @Mapping(target = "companyName", source = "request.business.companyName", defaultValue = "N/A")
    @Mapping(target = "addressFrom",source = "request.pickupAddress")
    @Mapping(target = "addressTo",source = "request.destinationAddress")
    @Mapping(target = "surveyFloors", source = "floors") // ✅ map list floors

    SurveyResponse toResponse(Surveys survey);
    @Mapping(target = "images", source = "images")

    SurveyFloorResponse toFloorResponse(SurveyFloor floor);

    // ✅ Map danh sách tầng
    List<SurveyFloorResponse> toFloorResponseList(List<SurveyFloor> floors);
    @Mapping(target = "imageUrl", source = "imageUrl") // ✅ map chính xác

    SurveyImageResponse toImageResponse(SurveyImage image);
    List<SurveyImageResponse> toImageResponseList(List<SurveyImage> images);


}

