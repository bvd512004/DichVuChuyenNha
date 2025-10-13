package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;
import com.swp391.dichvuchuyennha.entity.WorkProgress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface WorkProgressMapper {

    WorkProgressMapper INSTANCE = Mappers.getMapper(WorkProgressMapper.class);

    @Mapping(source = "contract.contractId", target = "contractId")
    @Mapping(source = "employee.employeeId", target = "employeeId")
    @Mapping(source = "taskDescription", target = "taskDescription")
    @Mapping(source = "progressStatus", target = "progressStatus")
    @Mapping(source = "updatedAt", target = "updatedAt")

    // 🔽 Các trường mở rộng
    @Mapping(//h
            target = "customerName",
            expression = "java(entity.getContract() != null && " +
                    "entity.getContract().getQuotation() != null && " +
                    "entity.getContract().getQuotation().getSurvey() != null && " +
                    "entity.getContract().getQuotation().getSurvey().getRequest() != null && " +
                    "entity.getContract().getQuotation().getSurvey().getRequest().getBusiness() != null " +
                    "? entity.getContract().getQuotation().getSurvey().getRequest().getBusiness().getCompanyName() " +
                    ": (entity.getContract().getQuotation().getSurvey().getRequest().getUser() != null " +
                    "? entity.getContract().getQuotation().getSurvey().getRequest().getUser().getUsername() : null))"
    )
    @Mapping(
            target = "serviceName",
            expression = "java(entity.getContract() != null && " +
                    "entity.getContract().getQuotation() != null && " +
                    "entity.getContract().getQuotation().getSurvey() != null && " +
                    "entity.getContract().getQuotation().getSurvey().getRequest() != null " +
                    "? entity.getContract().getQuotation().getSurvey().getRequest().getDescription() : null)"
    )
    @Mapping(source = "contract.startDate", target = "startDate")
    @Mapping(source = "contract.endDate", target = "endDate")
    @Mapping(source = "contract.totalAmount", target = "totalAmount")
    @Mapping(
            target = "employeeName",
            expression = "java(entity.getEmployee() != null && entity.getEmployee().getUser() != null " +
                    "? entity.getEmployee().getUser().getUsername() : null)"
    )
    WorkProgressResponse toResponse(WorkProgress entity);
}
