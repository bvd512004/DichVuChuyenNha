package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.PaymentResponse;
import com.swp391.dichvuchuyennha.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(target = "paymentId", source = "paymentId")
    @Mapping(target = "amount", source = "amount")
    @Mapping(target = "method", source = "method")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "paymentType", source = "paymentType")
    @Mapping(target = "checkoutUrl", source = "checkoutUrl")
    @Mapping(target = "orderCode", source = "orderCode")
    @Mapping(target = "dueDate", source = "dueDate")
    PaymentResponse toResponse(Payment payment);
}
