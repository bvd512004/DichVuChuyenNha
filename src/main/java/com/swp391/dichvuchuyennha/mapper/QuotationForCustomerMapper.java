package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.QuotationForCustomer;
import com.swp391.dichvuchuyennha.dto.response.QuotationServiceInfo;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import com.swp391.dichvuchuyennha.entity.Quotations;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring",
        uses = {QuotationServiceInfoMapper.class} )
public interface QuotationForCustomerMapper {
    @Mapping(target = "username",source = "survey.request.user.username")
    @Mapping(target = "companyName",source = "survey.request.user.customerCompany.companyName")
    @Mapping(target = "services", source = "quotationServices")
    @Mapping(target = "totalPrice",source = "totalPrice")
    @Mapping(target = "surveyDate",source = "survey.surveyDate")
    @Mapping(target = "addressFrom",source = "survey.request.pickupAddress")
    @Mapping(target = "addressTo",source = "survey.request.destinationAddress")


    QuotationForCustomer toInfo(Quotations quotations);

}
