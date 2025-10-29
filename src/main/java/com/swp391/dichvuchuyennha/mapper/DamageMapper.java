package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.response.DamageResponse;
import com.swp391.dichvuchuyennha.entity.Damages;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DamageMapper {
    @Mapping(source = "damageId", target = "damageId")
    @Mapping(source = "contract.contractId", target = "contractId")
    @Mapping(source = "cause", target = "cause")
    @Mapping(source = "responsibleEmployee.user.username", target = "employeeName")
    @Mapping(source = "cost", target = "cost")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "imageUrl", target = "imageUrl")
    @Mapping(source = "customerFeedback", target = "customerFeedback")
    DamageResponse toResponse(Damages damage);
}
