package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.request.QuotationServiceRequest;
import com.swp391.dichvuchuyennha.dto.response.ListQuotationServicesResponse;
import com.swp391.dichvuchuyennha.dto.response.PriceDTO;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import com.swp391.dichvuchuyennha.service.QuotationService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuotationServiceMapper {

    @Mapping(target = "id", ignore = true) // id tự sinh trong DB
    @Mapping(target = "quotation", ignore = true) // xử lý ở service
    @Mapping(target = "service", ignore = true)   // xử lý ở service
    @Mapping(target = "price", ignore = true)
        // xử lý ở service
    QuotationServices toEntity(QuotationServiceRequest request);
@Mapping(target = "username",source = "quotation.survey.request.user.username")
@Mapping(target = "companyName",source = "quotation.survey.request.user.customerCompany.companyName")
@Mapping(target = "serviceName",source = "service.serviceName")
@Mapping(target = "priceType",source = "price.priceType")
ListQuotationServicesResponse toListQuotationServicesResponse(QuotationServices quotationServices);
}