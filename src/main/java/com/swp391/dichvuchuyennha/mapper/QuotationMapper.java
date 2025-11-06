package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.request.QuotationCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.Quotations;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring",
        uses = {QuotationServiceInfoMapper.class} )

public interface QuotationMapper {
    @Mapping(target = "quotationId",ignore =true)
    @Mapping(target = "survey",ignore=true)
    Quotations toEntity(QuotationCreateRequest request);
    
    @Mapping(target = "quotationId", source = "quotationId", qualifiedByName = "toString")
    @Mapping(target = "surveyDate", expression = "java(getSurveyDate(quotations))")
    @Mapping(target = "addressFrom", expression = "java(getAddressFrom(quotations))")
    @Mapping(target = "addressTo", expression = "java(getAddressTo(quotations))")
    @Mapping(target = "username", expression = "java(getUsername(quotations))")
    @Mapping(target = "companyName", expression = "java(getCompanyName(quotations))")
    @Mapping(target = "services", source = "quotationServices")
    @Mapping(target = "phone", expression = "java(getPhone(quotations))")
    @Mapping(target = "employeeName", expression = "java(getEmployeeName(quotations))")
    @Mapping(target = "employeePhone", expression = "java(getEmployeePhone(quotations))")
    @Mapping(target = "employeeEmail", expression = "java(getEmployeeEmail(quotations))")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "totalPrice", source = "totalPrice")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "assignedEmployeeName", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "position", ignore = true)
    QuotationResponse toResponse(Quotations quotations);
    
    @Named("toString")
    default String toString(Integer value) {
        return value != null ? value.toString() : null;
    }
    
    default java.time.LocalDateTime getSurveyDate(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null) {
            return null;
        }
        return quotations.getSurvey().getSurveyDate();
    }
    
    default String getAddressFrom(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null || 
            quotations.getSurvey().getRequest() == null) {
            return null;
        }
        return quotations.getSurvey().getRequest().getPickupAddress();
    }
    
    default String getAddressTo(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null || 
            quotations.getSurvey().getRequest() == null) {
            return null;
        }
        return quotations.getSurvey().getRequest().getDestinationAddress();
    }
    
    default String getUsername(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null || 
            quotations.getSurvey().getRequest() == null ||
            quotations.getSurvey().getRequest().getUser() == null) {
            return null;
        }
        return quotations.getSurvey().getRequest().getUser().getUsername();
    }
    
    default String getPhone(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null || 
            quotations.getSurvey().getRequest() == null ||
            quotations.getSurvey().getRequest().getUser() == null) {
            return null;
        }
        return quotations.getSurvey().getRequest().getUser().getPhone();
    }
    
    default String getCompanyName(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null || 
            quotations.getSurvey().getRequest() == null ||
            quotations.getSurvey().getRequest().getUser() == null ||
            quotations.getSurvey().getRequest().getUser().getCustomerCompany() == null) {
            return null;
        }
        return quotations.getSurvey().getRequest().getUser().getCustomerCompany().getCompanyName();
    }
    
    default String getEmployeeName(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null || 
            quotations.getSurvey().getRequest() == null ||
            quotations.getSurvey().getRequest().getAssignedEmployee() == null ||
            quotations.getSurvey().getRequest().getAssignedEmployee().getUser() == null) {
            return null;
        }
        return quotations.getSurvey().getRequest().getAssignedEmployee().getUser().getUsername();
    }
    
    default String getEmployeePhone(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null || 
            quotations.getSurvey().getRequest() == null ||
            quotations.getSurvey().getRequest().getAssignedEmployee() == null ||
            quotations.getSurvey().getRequest().getAssignedEmployee().getUser() == null) {
            return null;
        }
        return quotations.getSurvey().getRequest().getAssignedEmployee().getUser().getPhone();
    }
    
    default String getEmployeeEmail(Quotations quotations) {
        if (quotations == null || quotations.getSurvey() == null || 
            quotations.getSurvey().getRequest() == null ||
            quotations.getSurvey().getRequest().getAssignedEmployee() == null ||
            quotations.getSurvey().getRequest().getAssignedEmployee().getUser() == null) {
            return null;
        }
        return quotations.getSurvey().getRequest().getAssignedEmployee().getUser().getEmail();
    }
}

