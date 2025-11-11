package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.ListPaymentResponse;
import com.swp391.dichvuchuyennha.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper (componentModel = "spring")
public interface ListPaymentMapper {
    @Mapping(target = "username",source = "contract.quotation.survey.request.user.username")
    @Mapping(target = "email",source = "contract.quotation.survey.request.user.email")
    @Mapping(target = "phone",source = "contract.quotation.survey.request.user.phone")
    @Mapping (target = "contractId",source = "contract.contractId")
    ListPaymentResponse toResponse (Payment payment);
}
