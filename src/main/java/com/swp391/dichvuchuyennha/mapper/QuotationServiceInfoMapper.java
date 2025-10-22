package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.QuotationServiceInfo;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuotationServiceInfoMapper {
    @Mapping(target = "serviceName", source = "service.serviceName")
    @Mapping(target = "priceType", source = "price.priceType")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "subtotal", source = "subtotal")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "amount",source = "price.amount")

    
    QuotationServiceInfo toResponse(QuotationServices entity);
}
