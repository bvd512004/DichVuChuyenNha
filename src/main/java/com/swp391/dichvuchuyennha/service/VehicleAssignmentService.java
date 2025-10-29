package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.VehicleDTO;
import com.swp391.dichvuchuyennha.entity.AssignmentVehicle;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Vehicles;
import com.swp391.dichvuchuyennha.repository.AssignmentVehicleRepository;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.VehiclesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleAssignmentService {

    private final AssignmentVehicleRepository assignmentVehicleRepo;
    private final VehiclesRepository vehicleRepo;
    private final ContractRepository contractRepo;

    @Transactional
    public void assignVehicleToContract(Integer contractId, Integer vehicleId, LocalDate assignedDate) {
        // Lấy thông tin hợp đồng và xe
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        Vehicles vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Lấy ngày moving_day từ hợp đồng
        if (contract.getQuotation() == null || contract.getQuotation().getRequest() == null 
                || contract.getQuotation().getRequest().getMovingDay() == null) {
            throw new RuntimeException("Contract missing quotation or moving day information");
        }
        
        LocalDate movingDay = contract.getQuotation().getRequest().getMovingDay().toInstant()
                .atZone(ZoneId.systemDefault()).toLocalDate();

        // Kiểm tra nếu xe đã được gán vào hợp đồng khác trong ngày movingDay
        List<AssignmentVehicle> existingAssignments = assignmentVehicleRepo.findAssignmentsByVehicleAndDate(vehicleId, movingDay);

        if (!existingAssignments.isEmpty()) {
            throw new RuntimeException("Vehicle is already assigned to another contract on this day");
        }

        // Gán xe vào hợp đồng
        AssignmentVehicle assignment = new AssignmentVehicle();
        assignment.setContract(contract);
        assignment.setVehicle(vehicle);
        assignment.setAssignedTime(assignedDate);
        assignment.setAssignDate(movingDay); // Lưu ngày gán vào bảng assignment_vehicle

        assignmentVehicleRepo.save(assignment);

        // Cập nhật trạng thái xe thành 'BUSY'
        vehicle.setStatus("BUSY");
        vehicleRepo.save(vehicle);
    }

    /** Lấy danh sách xe đã gán theo hợp đồng */
    @Transactional(readOnly = true)
    public List<VehicleDTO> getAssignedVehiclesByContract(Integer contractId) {
        List<AssignmentVehicle> assignments = assignmentVehicleRepo.findByContractContractId(contractId);
        return assignments.stream()
                .map(av -> new VehicleDTO(
                        av.getVehicle().getVehicleId(),
                        av.getVehicle().getVehicleType(),
                        av.getVehicle().getLicensePlate(),
                        av.getVehicle().getCapacity(),
                        av.getVehicle().getStatus(),
                        av.getVehicle().getDriver() != null ? av.getVehicle().getDriver().getUser().getUsername() : "Chưa có tài xế",
                        av.getVehicle().getDriver() != null ? av.getVehicle().getDriver().getPosition() : ""
                ))
                .collect(Collectors.toList());
    }

    /** Lấy danh sách xe có sẵn (AVAILABLE) */
    @Transactional(readOnly = true)
    public List<VehicleDTO> getAvailableVehicles() {
        List<Vehicles> vehicles = vehicleRepo.findByStatus("AVAILABLE");
        return vehicles.stream()
                .map(v -> new VehicleDTO(
                        v.getVehicleId(),
                        v.getVehicleType(),
                        v.getLicensePlate(),
                        v.getCapacity(),
                        v.getStatus(),
                        v.getDriver() != null ? v.getDriver().getUser().getUsername() : "Chưa có tài xế",
                        v.getDriver() != null ? v.getDriver().getPosition() : ""
                ))
                .collect(Collectors.toList());
    }

    /** Bỏ gán xe khỏi hợp đồng */
    @Transactional
    public void unassignVehicle(Integer contractId, Integer vehicleId) {
        AssignmentVehicle assignment = assignmentVehicleRepo.findByContractContractId(contractId).stream()
                .filter(av -> av.getVehicle().getVehicleId().equals(vehicleId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignmentVehicleRepo.delete(assignment);
        
        // Cập nhật trạng thái xe thành 'AVAILABLE'
        Vehicles vehicle = assignment.getVehicle();
        vehicle.setStatus("AVAILABLE");
        vehicleRepo.save(vehicle);
    }
}
