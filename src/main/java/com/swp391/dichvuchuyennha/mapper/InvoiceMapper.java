package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.InvoiceResponse;
import com.swp391.dichvuchuyennha.entity.Invoices;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(
        componentModel = "spring",
        uses = {QuotationServiceInfoMapper.class} // 🔹 sử dụng mapper phụ
)
public interface InvoiceMapper {
    InvoiceMapper INSTANCE = Mappers.getMapper(InvoiceMapper.class);

    @Mapping(target = "username", source = "contract.quotation.survey.request.user.username")
    @Mapping(target = "email", source = "contract.quotation.survey.request.user.email")
    @Mapping(target = "phone", source = "contract.quotation.survey.request.user.phone")
    @Mapping(target = "services", source = "contract.quotation.quotationServices")
    InvoiceResponse toResponse(Invoices invoices);
}
