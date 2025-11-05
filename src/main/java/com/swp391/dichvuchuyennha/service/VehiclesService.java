package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.VehicleAssignRequest;
import com.swp391.dichvuchuyennha.dto.response.VehicleResponse;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.entity.Vehicles;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.VehiclesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehiclesService {

    private final VehiclesRepository vehiclesRepository;
    private final ContractRepository contractRepository;

    /**
     * Lấy danh sách xe có sẵn để gán
     */
    public List<VehicleResponse> getAvailableVehicles() {
        List<Vehicles> vehicles = vehiclesRepository.findAvailableVehicles();
        return vehicles.stream()
                .map(this::toVehicleResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách xe đã được gán cho hợp đồng (qua quotation)
     */
    public List<VehicleResponse> getVehiclesByContract(Integer contractId) {
        // Lấy contract
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));

        // Lấy quotation từ contract
        Quotations quotation = contract.getQuotation();
        if (quotation == null) {
            throw new RuntimeException("Contract does not have a quotation");
        }

        // Lấy xe đã gán cho quotation này
        List<Vehicles> vehicles = vehiclesRepository.findByQuotation_QuotationId(quotation.getQuotationId());
        return vehicles.stream()
                .map(this::toVehicleResponse)
                .collect(Collectors.toList());
    }

    /**
     * Gán xe cho hợp đồng (qua quotation)
     */
    @Transactional
    public VehicleResponse assignVehicleToContract(VehicleAssignRequest request) {
        // Lấy contract
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + request.getContractId()));

        // Kiểm tra contract đã được ký chưa
        if (contract.getSignedDate() == null) {
            throw new RuntimeException("Contract must be signed before assigning vehicle");
        }

        // Lấy quotation từ contract
        Quotations quotation = contract.getQuotation();
        if (quotation == null) {
            throw new RuntimeException("Contract does not have a quotation");
        }

        // Lấy vehicle
        Vehicles vehicle = vehiclesRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + request.getVehicleId()));

        // Kiểm tra xe đã được gán cho quotation khác chưa
        if (vehicle.getQuotation() != null && !vehicle.getQuotation().getQuotationId().equals(quotation.getQuotationId())) {
            throw new RuntimeException("Vehicle is already assigned to another quotation");
        }

        // Gán xe cho quotation
        vehicle.setQuotation(quotation);
        vehicle.setStatus("ASSIGNED");
        Vehicles savedVehicle = vehiclesRepository.save(vehicle);

        return toVehicleResponse(savedVehicle);
    }

    /**
     * Hủy gán xe khỏi hợp đồng
     */
    @Transactional
    public void unassignVehicleFromContract(Integer contractId, Integer vehicleId) {
        // Lấy contract
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));

        // Lấy quotation từ contract
        Quotations quotation = contract.getQuotation();
        if (quotation == null) {
            throw new RuntimeException("Contract does not have a quotation");
        }

        // Lấy vehicle
        Vehicles vehicle = vehiclesRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));

        // Kiểm tra xe có được gán cho quotation này không
        if (vehicle.getQuotation() == null || !vehicle.getQuotation().getQuotationId().equals(quotation.getQuotationId())) {
            throw new RuntimeException("Vehicle is not assigned to this contract");
        }

        // Hủy gán
        vehicle.setQuotation(null);
        vehicle.setStatus("AVAILABLE");
        vehiclesRepository.save(vehicle);
    }

    /**
     * Convert Vehicles entity to VehicleResponse DTO
     */
    private VehicleResponse toVehicleResponse(Vehicles vehicle) {
        VehicleResponse.VehicleResponseBuilder builder = VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .vehicleType(vehicle.getVehicleType())
                .licensePlate(vehicle.getLicensePlate())
                .capacity(vehicle.getCapacity())
                .status(vehicle.getStatus());

        if (vehicle.getQuotation() != null) {
            builder.quotationId(vehicle.getQuotation().getQuotationId());
        }

        if (vehicle.getDriver() != null) {
            builder.driverId(vehicle.getDriver().getEmployeeId());
            if (vehicle.getDriver().getUser() != null) {
                builder.driverUsername(vehicle.getDriver().getUser().getUsername());
            }
        }

        return builder.build();
    }
}
