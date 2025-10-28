package com.swp391.dichvuchuyennha.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.swp391.dichvuchuyennha.dto.request.VehicleCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.VehicleResponse;
import com.swp391.dichvuchuyennha.entity.Vehicles;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.mapper.VehicleMapper;
import com.swp391.dichvuchuyennha.repository.VehiclesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehiclesService {
    private final VehiclesRepository vehiclesRepository;
    private final VehicleMapper vehicleMapper;

    public List<VehicleResponse> getAllVehicles() {
        return vehiclesRepository.findAll().stream()
                .map(vehicleMapper::toResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponse getVehicleById(Integer id) {
        Vehicles vehicle = vehiclesRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_FOUND));
        return vehicleMapper.toResponse(vehicle);
    }

    public VehicleResponse createVehicle(VehicleCreateRequest request) {
        Vehicles vehicle = vehicleMapper.toEntity(request);
        return vehicleMapper.toResponse(vehiclesRepository.save(vehicle));
    }

    public VehicleResponse updateVehicle(Integer id, VehicleCreateRequest request) {
        Vehicles vehicle = vehiclesRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_FOUND));
        vehicleMapper.updateFromRequest(request, vehicle);
        return vehicleMapper.toResponse(vehiclesRepository.save(vehicle));
    }

    public void deleteVehicle(Integer id) {
        if (!vehiclesRepository.existsById(id)) {
            throw new AppException(ErrorCode.VEHICLE_NOT_FOUND);
        }
        vehiclesRepository.deleteById(id);
    }
}