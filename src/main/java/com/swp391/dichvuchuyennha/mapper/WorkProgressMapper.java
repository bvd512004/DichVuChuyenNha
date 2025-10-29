package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.DamageResponse;
import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;
import com.swp391.dichvuchuyennha.entity.Damages;
import com.swp391.dichvuchuyennha.entity.WorkProgress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface WorkProgressMapper {

    WorkProgressMapper INSTANCE = Mappers.getMapper(WorkProgressMapper.class);

    @Mapping(source = "contract.contractId", target = "contractId")
    @Mapping(source = "employee.employeeId", target = "employeeId")
    @Mapping(source = "taskDescription", target = "taskDescription")
    @Mapping(source = "progressStatus", target = "progressStatus")
    @Mapping(source = "updatedAt", target = "updatedAt")

    // Các trường mở rộng
    @Mapping(
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
    @Mapping(target = "damages", expression = "java(mapDamages(entity.getContract().getDamages()))")
    WorkProgressResponse toResponse(WorkProgress entity);

    // 🔽 Hàm convert danh sách Damages sang DamageResponse
    default List<DamageResponse> mapDamages(List<Damages> damagesList) {
        if (damagesList == null) return null;
        return damagesList.stream().map(d -> DamageResponse.builder()
                .damageId(d.getDamageId())
                .contractId(d.getContract().getContractId())
                .cause(d.getCause())
                .cost(d.getCost())
                .status(d.getStatus())
                .imageUrl(d.getImageUrl())
                .employeeName(d.getResponsibleEmployee() != null ?
                        d.getResponsibleEmployee().getUser().getUsername() : null)
                .customerFeedback(d.getCustomerFeedback())
                .build()
        ).collect(Collectors.toList());
    }
}
