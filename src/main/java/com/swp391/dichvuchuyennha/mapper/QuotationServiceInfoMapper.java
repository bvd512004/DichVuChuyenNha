package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.QuotationServiceInfo;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuotationServiceInfoMapper {
    @Mapping(target = "serviceName", expression = "java(getServiceName(entity))")
    @Mapping(target = "priceType", expression = "java(getPriceType(entity))")
    @Mapping(target = "quantity", source = "quantity")
    @Mapping(target = "subtotal", source = "subtotal")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "amount", expression = "java(getAmount(entity))")

    
    QuotationServiceInfo toResponse(QuotationServices entity);
    
    default String getServiceName(QuotationServices entity) {
        if (entity == null || entity.getService() == null) {
            return null;
        }
        return entity.getService().getServiceName();
    }
    
    default String getPriceType(QuotationServices entity) {
        if (entity == null || entity.getPrice() == null) {
            return null;
        }
        return entity.getPrice().getPriceType();
    }
    
    default Double getAmount(QuotationServices entity) {
        if (entity == null || entity.getPrice() == null) {
            return null;
        }
        return entity.getPrice().getAmount();
    }
}
