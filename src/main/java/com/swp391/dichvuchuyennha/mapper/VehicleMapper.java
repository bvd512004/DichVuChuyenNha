package com.swp391.dichvuchuyennha.mapper;

import org.springframework.stereotype.Component;

import com.swp391.dichvuchuyennha.dto.request.VehicleCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.VehicleResponse;
import com.swp391.dichvuchuyennha.entity.Vehicles;

@Component
public class VehicleMapper {

    public Vehicles toEntity(VehicleCreateRequest request) {
        Vehicles vehicle = new Vehicles();
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setStatus(request.getStatus());
        // Set driver nếu có
        return vehicle;
    }

    public void updateFromRequest(VehicleCreateRequest request, Vehicles vehicle) {
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setStatus(request.getStatus());
    }

    public VehicleResponse toResponse(Vehicles vehicle) {
        VehicleResponse response = new VehicleResponse();
        response.setVehicleId(vehicle.getVehicleId());
        response.setVehicleType(vehicle.getVehicleType());
        response.setLicensePlate(vehicle.getLicensePlate());
        response.setCapacity(vehicle.getCapacity());
        response.setStatus(vehicle.getStatus());
        response.setDriverId(vehicle.getDriver() != null ? vehicle.getDriver().getEmployeeId() : null);
        return response;
    }
}