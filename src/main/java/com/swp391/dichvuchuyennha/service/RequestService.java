package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.RequestCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.RequestDto;
import com.swp391.dichvuchuyennha.dto.response.RequestResponse;
import com.swp391.dichvuchuyennha.entity.Notification;
import com.swp391.dichvuchuyennha.entity.RequestAssignment;
import com.swp391.dichvuchuyennha.entity.Requests;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.repository.NotificationRepository;
import com.swp391.dichvuchuyennha.repository.RequestRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public RequestResponse createRequest(Users currentUser, RequestCreateRequest requestDto) {
        Requests request = new Requests();
        request.setUser(currentUser);
        request.setDestinationAddress(requestDto.getDestinationAddress());

        if (requestDto.getBusinessId() != null && currentUser.getCustomerCompany() != null
                && currentUser.getCustomerCompany().getBusinessId().equals(requestDto.getBusinessId())) {
            request.setBusiness(currentUser.getCustomerCompany());
        }
        request.setRequestTime(LocalDateTime.now());
        if (requestDto.getMovingDay() != null) {
            request.setMovingDay(requestDto.getMovingDay());
        }
        request.setDescription(requestDto.getDescription());
        request.setPickupAddress(requestDto.getPickupAddress());
        request.setMovingType(requestDto.getMovingType());
        request.setStatus("PENDING");
        requestRepository.save(request);


        userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "MANAGER".equalsIgnoreCase(u.getRole().getRoleName()))
                .forEach(manager -> {
                    Notification noti = new Notification();
                    noti.setUser(manager);
                    noti.setTitle("Yêu cầu chuyển nhà mới");
                    noti.setMessage("Khách hàng " + currentUser.getUsername() + " đã tạo yêu cầu mới (#" + request.getRequestId() + ")");
                    noti.setType("REQUEST_CREATED");
                    noti.setIsRead(false);
                    noti.setCreateAt(LocalDateTime.now());
                    notificationRepository.save(noti);
                });

        return RequestResponse.builder()
                .requestId(request.getRequestId())
                .status(request.getStatus())
                .description(request.getDescription())
                .requestTime(request.getRequestTime())
                .pickupAddress(request.getPickupAddress())
                .destinationAddress(request.getDestinationAddress())
                .movingDay(request.getMovingDay())
                .movingType(request.getMovingType())
                .build();
    }

    public List<RequestResponse> getMyRequests(Users currentUser) {
        List<Requests> requests = requestRepository.findByUserOrderByRequestTimeDesc(currentUser);
        return requests.stream()
                .map(r -> RequestResponse.builder()
                        .requestId(r.getRequestId())
                        .status(r.getStatus())
                        .description(r.getDescription())
                        .requestTime(r.getRequestTime())
                        .pickupAddress(r.getPickupAddress())
                        .destinationAddress(r.getDestinationAddress())
                        .movingDay(r.getMovingDay())
                        .movingType(r.getMovingType())
                        .build())
                .collect(Collectors.toList());
    }

    public List<RequestDto> getAllRequests() {
        List<Requests> requests = requestRepository.findAllWithDetails();
        System.out.println("Total requests found: " + requests.size()); // Debug log
        
        return requests.stream()
                .map(r -> {
                    // Lấy assignment gần nhất nếu có
                    RequestAssignment assignment = 
                            r.getAssignedEmployees() != null && !r.getAssignedEmployees().isEmpty()
                                    ? r.getAssignedEmployees().get(0)
                                    : null;

                    // Debug log cho mỗi request
                    System.out.println("Processing request ID: " + r.getRequestId());
                    System.out.println("  - User: " + (r.getUser() != null ? r.getUser().getUsername() : "NULL"));
                    System.out.println("  - Business: " + (r.getBusiness() != null ? r.getBusiness().getCompanyName() : "NULL"));
                    
                    return RequestDto.builder()
                            .requestId(r.getRequestId())
                            .username(r.getUser() != null ? r.getUser().getUsername() : "N/A")
                            .companyName(r.getBusiness() != null ? r.getBusiness().getCompanyName() : "N/A")
                            .requestTime(r.getRequestTime())
                            .status(r.getStatus())
                            .assignmentStatus(assignment != null ? assignment.getStatus() : "NOT_ASSIGNED")
                            .pickupAddress(r.getPickupAddress())
                            .destinationAddress(r.getDestinationAddress())
                            .description(r.getDescription())
                            .movingType(r.getMovingType())
                            .movingDay(r.getMovingDay())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public RequestDto updateRequestStatus(Integer requestId, String newStatus) {
        Requests request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        request.setStatus(newStatus);
        Requests updated = requestRepository.save(request);
        
        // Lấy assignment nếu có
        RequestAssignment assignment = 
                updated.getAssignedEmployees() != null && !updated.getAssignedEmployees().isEmpty()
                        ? updated.getAssignedEmployees().get(0)
                        : null;
        
        return RequestDto.builder()
                .requestId(updated.getRequestId())
                .username(updated.getUser() != null ? updated.getUser().getUsername() : "N/A")
                .companyName(updated.getBusiness() != null ? updated.getBusiness().getCompanyName() : "N/A")
                .requestTime(updated.getRequestTime())
                .status(updated.getStatus())
                .assignmentStatus(assignment != null ? assignment.getStatus() : "NOT_ASSIGNED")
                .pickupAddress(updated.getPickupAddress())
                .destinationAddress(updated.getDestinationAddress())
                .description(updated.getDescription())
                .movingType(updated.getMovingType())
                .movingDay(updated.getMovingDay())
                .build();
    }

}


