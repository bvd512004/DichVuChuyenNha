//package com.swp391.dichvuchuyennha.mapper;
//
//import com.swp391.dichvuchuyennha.dto.response.QuotationForCustomer;
//import com.swp391.dichvuchuyennha.dto.response.QuotationServiceInfo;
//import com.swp391.dichvuchuyennha.entity.QuotationServices;
//import org.mapstruct.Mapper;
//import org.mapstruct.Mapping;
//
//import java.util.List;
//
//@Mapper(componentModel = "spring")
//public interface QuotationForCustomerMapper {
//    @Mapping(target = "username",source = "quotation.survey.request.user.username")
//    @Mapping(target = "companyName",source = "quotation.survey.request.user.customerCompany.companyName")
//    @Mapping(target = "services", expression = "java(mapQuotationServices(contract.getQuotation().getQuotationServices()))")
//    @Mapping(target = "totalPrice",source = "quotation.totalPrice")
//    @Mapping(target = "surveyDate",source = "quotation.survey.surveyDate")
//    @Mapping(target = "addressFrom",source = "quotation.survey.addressFrom")
//    @Mapping(target = "addressTo",source = "quotation.survey.addressTo")
//    @Mapping(target = "listService",source = "quotation.survey.listService")
//    QuotationForCustomer toInfo(QuotationServices quotationServices);
//    default List<QuotationServiceInfo> mapQuotationServices(List<QuotationServices> services) {
//        if (services == null) return List.of();
//        return services.stream().map(s -> QuotationServiceInfo.builder()
//                .serviceName(s.getService().getServiceName())
//                .priceType(s.getPrice().getPriceType())
//                .quantity(s.getQuantity())
//                .subtotal(s.getSubtotal())
//                .build()).toList();
//    }
//}
