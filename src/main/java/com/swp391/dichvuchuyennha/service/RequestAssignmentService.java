package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.EmployeeDTO;
import com.swp391.dichvuchuyennha.dto.response.RequestDto;
import com.swp391.dichvuchuyennha.entity.Employee;
import com.swp391.dichvuchuyennha.entity.RequestAssignment;
import com.swp391.dichvuchuyennha.entity.Requests;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import com.swp391.dichvuchuyennha.repository.RequestAssignmentRepository;
import com.swp391.dichvuchuyennha.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RequestAssignmentService {

    @Autowired
    private RequestAssignmentRepository requestAssignmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RequestRepository requestsRepository;

    // ✅ Gán request cho nhân viên
    public RequestAssignment assignRequestToEmployee(Integer requestId, Integer employeeId) {
        Requests request = requestsRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        RequestAssignment ra = new RequestAssignment();
        ra.setRequest(request);
        ra.setEmployee(employee);
        ra.setStatus("assigned");
        ra.setAssignedDate(LocalDateTime.now());

        // ✅ Gán nhân viên phụ trách chính cho request (nếu dùng Cách 1)
        request.setAssignedEmployee(employee);

        // ✅ Cập nhật trạng thái nhân viên về "busy"
        employee.setStatus("busy");
        employeeRepository.save(employee);

        // ✅ Cập nhật trạng thái request thành "PENDING"
        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            request.setStatus("PENDING");
        }

        // ✅ Lưu cả request và assignment
        requestsRepository.save(request);
        return requestAssignmentRepository.save(ra);
    }


    // ✅ Lấy danh sách surveyer đang "free"
    public List<EmployeeDTO> getFreeSurveyers() {
        return employeeRepository.findByPositionAndStatus("surveyer", "free")
                .stream()
                .map(e -> new EmployeeDTO(
                        e.getEmployeeId(),
                        e.getUser().getUsername(),
                        e.getPosition()
                ))
                .collect(Collectors.toList());
    }

    // ✅ Lấy danh sách request PENDING của surveyer đang đăng nhập
    public List<RequestDto> getRequestsForLoggedInSurveyer() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Employee employee = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Lấy các assignment của nhân viên đó
        List<RequestAssignment> assignments =
                requestAssignmentRepository.findByEmployee_EmployeeId(employee.getEmployeeId());

        // Chỉ lấy request có trạng thái "PENDING"
        return assignments.stream()
                .map(ra -> RequestDto.builder()
                        .requestId(ra.getRequest().getRequestId())
                        .username(ra.getRequest().getUser() != null
                                ? ra.getRequest().getUser().getUsername()
                                : "N/A")
                        .companyName(ra.getRequest().getBusiness() != null
                                ? ra.getRequest().getBusiness().getCompanyName()
                                : "N/A")
                        .requestTime(ra.getRequest().getRequestTime())
                        .status(ra.getRequest().getStatus())
                        .destinationAddress(ra.getRequest().getDestinationAddress())
                        .pickupAddress(ra.getRequest().getPickupAddress())
                        .build())
                .collect(Collectors.toList());
    }
}
