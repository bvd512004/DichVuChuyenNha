package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.VehicleAssignRequest;
import com.swp391.dichvuchuyennha.dto.response.DriverResponse;
import com.swp391.dichvuchuyennha.dto.response.DriverScheduleResponse;
import com.swp391.dichvuchuyennha.dto.response.VehicleResponse;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Employee;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.entity.Requests;
import com.swp391.dichvuchuyennha.entity.Vehicles;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import com.swp391.dichvuchuyennha.repository.VehiclesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class VehiclesService {

    private final VehiclesRepository vehiclesRepository;
    private final ContractRepository contractRepository;
    private final EmployeeRepository employeeRepository;

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
     * Lấy danh sách tài xế rảnh để gán cho xe
     */
    public List<DriverResponse> getAvailableDrivers() {
        List<Employee> drivers = employeeRepository.findDriversWithStatus("driver", "free");
        List<Employee> localizedDrivers = employeeRepository.findDriversWithStatus("tài xế", "free");

        return Stream.concat(drivers.stream(), localizedDrivers.stream())
                .collect(Collectors.toMap(Employee::getEmployeeId, e -> e, (first, second) -> first))
                .values()
                .stream()
                .map(this::toDriverResponse)
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

        Employee newDriver = null;
        if (request.getDriverId() != null) {
            newDriver = employeeRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new RuntimeException("Driver not found with id: " + request.getDriverId()));

            // Kiểm tra driver đã được gán cho xe khác đang hoạt động chưa
            boolean driverBusy = vehiclesRepository.existsByDriver_EmployeeIdAndStatusNotIgnoreCase(newDriver.getEmployeeId(), "AVAILABLE");
            if (driverBusy && (vehicle.getDriver() == null || !vehicle.getDriver().getEmployeeId().equals(newDriver.getEmployeeId()))) {
                throw new RuntimeException("Driver is already assigned to another vehicle");
            }
        }

        // Giải phóng tài xế cũ nếu khác với tài xế mới
        if (vehicle.getDriver() != null && (newDriver == null || !vehicle.getDriver().getEmployeeId().equals(newDriver.getEmployeeId()))) {
            Employee previousDriver = vehicle.getDriver();
            previousDriver.setStatus("FREE");
            employeeRepository.save(previousDriver);
            if (newDriver == null) {
                vehicle.setDriver(null);
            }
        }

        // Gán xe cho quotation
        vehicle.setQuotation(quotation);
        vehicle.setStatus("ASSIGNED");
        if (newDriver != null) {
            vehicle.setDriver(newDriver);
            newDriver.setStatus("BUSY");
            employeeRepository.save(newDriver);
        }
        Vehicles savedVehicle = vehiclesRepository.save(vehicle);

        return toVehicleResponse(savedVehicle);
    }

    /**
     * Gán tài xế cho xe đã được gán hợp đồng
     */
    @Transactional
    public VehicleResponse assignDriverToVehicle(Integer contractId, Integer vehicleId, Integer driverId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));

        Quotations quotation = contract.getQuotation();
        if (quotation == null) {
            throw new RuntimeException("Contract does not have a quotation");
        }

        Vehicles vehicle = vehiclesRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + vehicleId));

        if (vehicle.getQuotation() == null || !vehicle.getQuotation().getQuotationId().equals(quotation.getQuotationId())) {
            throw new RuntimeException("Vehicle is not assigned to this contract");
        }

        Employee driver = employeeRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + driverId));

        boolean driverBusy = vehiclesRepository.existsByDriver_EmployeeIdAndStatusNotIgnoreCase(driverId, "AVAILABLE");
        if (driverBusy && (vehicle.getDriver() == null || !vehicle.getDriver().getEmployeeId().equals(driverId))) {
            throw new RuntimeException("Driver is already assigned to another vehicle");
        }

        if (vehicle.getDriver() != null && !vehicle.getDriver().getEmployeeId().equals(driverId)) {
            Employee previousDriver = vehicle.getDriver();
            previousDriver.setStatus("FREE");
            employeeRepository.save(previousDriver);
        }

        vehicle.setDriver(driver);
        vehicle.setStatus("ASSIGNED");
        driver.setStatus("BUSY");
        employeeRepository.save(driver);

        Vehicles saved = vehiclesRepository.save(vehicle);
        return toVehicleResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DriverScheduleResponse> getDriverSchedulesForDriver(Long userId) {
        Employee driver = employeeRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Driver profile not found for user id: " + userId));

        if (driver.getPosition() == null ||
                (!driver.getPosition().equalsIgnoreCase("driver") && !driver.getPosition().equalsIgnoreCase("tài xế"))) {
            throw new RuntimeException("User is not registered as a driver");
        }

        List<Vehicles> vehicles = vehiclesRepository.findByDriver_EmployeeId(driver.getEmployeeId());

        return vehicles.stream()
                .map(vehicle -> toDriverScheduleResponse(vehicle, driver.getEmployeeId()))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(DriverScheduleResponse::getMovingDay,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
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

        if (vehicle.getDriver() != null) {
            Employee driver = vehicle.getDriver();
            driver.setStatus("FREE");
            employeeRepository.save(driver);
            vehicle.setDriver(null);
        }

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

    private DriverResponse toDriverResponse(Employee employee) {
        return DriverResponse.builder()
                .employeeId(employee.getEmployeeId())
                .username(employee.getUser() != null ? employee.getUser().getUsername() : null)
                .fullName(employee.getUser() != null ? employee.getUser().getUsername() : null)
                .phone(employee.getPhone())
                .status(employee.getStatus())
                .build();
    }

    private DriverScheduleResponse toDriverScheduleResponse(Vehicles vehicle, Integer driverId) {
        if (vehicle.getQuotation() == null) {
            return null;
        }

        Contract contract = vehicle.getQuotation().getContracts() != null
                ? vehicle.getQuotation().getContracts().stream()
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null)
                : null;

        if (contract == null) {
            return null;
        }

        Requests request = null;
        if (vehicle.getQuotation().getSurvey() != null) {
            request = vehicle.getQuotation().getSurvey().getRequest();
        }

        Date movingDayRaw = request != null ? request.getMovingDay() : null;
        LocalDate movingDay = null;
        if (movingDayRaw != null) {
            movingDay = movingDayRaw.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
        }

        return DriverScheduleResponse.builder()
                .contractId(contract.getContractId())
                .contractStatus(contract.getStatus())
                .vehicleId(vehicle.getVehicleId())
                .vehicleType(vehicle.getVehicleType())
                .licensePlate(vehicle.getLicensePlate())
                .capacity(vehicle.getCapacity())
                .movingDay(movingDay)
                .pickupAddress(request != null ? request.getPickupAddress() : null)
                .destinationAddress(request != null ? request.getDestinationAddress() : null)
                .build();
    }
}
