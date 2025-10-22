package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.request.QuotationCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.Quotations;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",
        uses = {QuotationServiceInfoMapper.class} )

public interface QuotationMapper {
    @Mapping(target = "quotationId",ignore =true)
    @Mapping(target = "survey",ignore=true)
    Quotations toEntity(QuotationCreateRequest request);
    @Mapping(target = "surveyDate",source = "survey.surveyDate")
    @Mapping(target = "addressFrom",source = "survey.request.pickupAddress")
    @Mapping(target = "addressTo",source = "survey.request.destinationAddress")
    @Mapping(target = "username",source = "survey.request.user.username")
    @Mapping(target = "companyName",source = "survey.request.user.customerCompany.companyName")
    @Mapping(target = "services", source = "quotationServices") //
    @Mapping(target = "phone",source = "survey.request.user.phone")
    QuotationResponse toResponse(Quotations quotations);
}

