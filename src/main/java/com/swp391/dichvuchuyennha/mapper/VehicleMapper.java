package com.swp391.dichvuchuyennha.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.swp391.dichvuchuyennha.dto.request.VehicleCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.VehicleResponse;
import com.swp391.dichvuchuyennha.entity.Vehicles;

@Mapper(componentModel = "spring")
public interface VehicleMapper {

    @Mapping(target = "vehicleId", ignore = true)
    @Mapping(target = "quotation", ignore = true)
    @Mapping(target = "driver", ignore = true)
    Vehicles toEntity(VehicleCreateRequest request);

    @Mapping(target = "vehicleId", ignore = true)
    @Mapping(target = "quotation", ignore = true)
    @Mapping(target = "driver", ignore = true)
    void updateFromRequest(VehicleCreateRequest request, @MappingTarget Vehicles vehicle);

    @Mapping(target = "driverId", source = "driver.employeeId")
    @Mapping(target = "quotationId", source = "quotation.quotationId")
    VehicleResponse toResponse(Vehicles vehicle);
}