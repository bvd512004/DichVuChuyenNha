package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.DriverContractDTO;
import com.swp391.dichvuchuyennha.entity.AssignmentVehicle;
import com.swp391.dichvuchuyennha.entity.Employee;
import com.swp391.dichvuchuyennha.repository.AssignmentVehicleRepository;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import com.swp391.dichvuchuyennha.repository.WorkProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final EmployeeRepository employeeRepository;
    private final AssignmentVehicleRepository assignmentVehicleRepository;
    private final WorkProgressRepository workProgressRepository;

    /**
     * Lấy danh sách hợp đồng mà driver được gán vận chuyển
     */
    @Transactional(readOnly = true)
    public List<DriverContractDTO> getDriverContracts() {
        // Lấy thông tin driver đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee driver = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // Lấy tất cả vehicles mà driver này lái
        List<AssignmentVehicle> assignments = assignmentVehicleRepository.findAll()
                .stream()
                .filter(av -> av.getVehicle() != null 
                        && av.getVehicle().getDriver() != null
                        && av.getVehicle().getDriver().getEmployeeId().equals(driver.getEmployeeId()))
                .collect(Collectors.toList());

        return assignments.stream()
                .map(assignment -> {
                    var contract = assignment.getContract();
                    var vehicle = assignment.getVehicle();
                    var quotation = contract != null ? contract.getQuotation() : null;
                    var request = quotation != null ? quotation.getRequest() : null;
                    var user = request != null ? request.getUser() : null;

                    // Lấy work progress status
                    String workStatus = "NOT_STARTED";
                    if (contract != null) {
                        var workProgressList = workProgressRepository.findByContract_ContractId(contract.getContractId());
                        if (!workProgressList.isEmpty()) {
                            var latestProgress = workProgressList.get(0);
                            workStatus = latestProgress.getProgressStatus() != null ? latestProgress.getProgressStatus() : "NOT_STARTED";
                        }
                    }

                    return DriverContractDTO.builder()
                            .contractId(contract != null ? contract.getContractId() : null)
                            .contractStatus(contract != null ? contract.getStatus() : "UNKNOWN")
                            .quotationId(quotation != null ? quotation.getQuotationId() : null)
                            .totalPrice(quotation != null ? quotation.getTotalPrice() : null)
                            .vehicleId(vehicle != null ? vehicle.getVehicleId() : null)
                            .vehicleType(vehicle != null ? vehicle.getVehicleType() : null)
                            .licensePlate(vehicle != null ? vehicle.getLicensePlate() : null)
                            .pickupAddress(request != null ? request.getPickupAddress() : null)
                            .destinationAddress(request != null ? request.getDestinationAddress() : null)
                            .movingDay(request != null ? request.getMovingDay() : null)
                            .description(request != null ? request.getDescription() : null)
                            .customerName(user != null ? user.getUsername() : null)
                            .customerPhone(user != null ? user.getPhone() : null)
                            .startDate(contract != null ? contract.getStartDate() : null)
                            .endDate(contract != null ? contract.getEndDate() : null)
                            .signedDate(contract != null ? contract.getSignedDate() : null)
                            .workStatus(workStatus)
                            .build();
                })
                .collect(Collectors.toList());
    }
}

