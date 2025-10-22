package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.ContractResponse;
import com.swp391.dichvuchuyennha.dto.response.QuotationServiceInfo;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ContractMapper {

    // Map entity -> dto
    @Mapping(target = "contractId", source = "contractId")
    @Mapping(target = "signedById", source = "signedBy.userId")
    @Mapping(target = "signedByUsername", source = "signedBy.username")
    @Mapping(target = "startLocation", source = "quotation.survey.request.pickupAddress")
    @Mapping(target = "endLocation", source = "quotation.survey.request.destinationAddress")
    @Mapping(target = "services", expression = "java(mapQuotationServices(contract.getQuotation().getQuotationServices()))")
    @Mapping(target = "totalPrice",source = "quotation.totalPrice")
    @Mapping(target = "username",source = "quotation.survey.request.user.username")
    @Mapping(target = "companyName",source = "quotation.survey.request.user.customerCompany.companyName")

    ContractResponse toResponse(Contract contract);

    default List<QuotationServiceInfo> mapQuotationServices(List<QuotationServices> services) {
        if (services == null) return List.of();
        return services.stream().map(s -> QuotationServiceInfo.builder()
                .serviceName(s.getService().getServiceName())
                .priceType(s.getPrice().getPriceType())
                .quantity(s.getQuantity())
                .subtotal(s.getSubtotal())
                .build()).toList();
    }

}
