package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.RequestCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.RequestResponse;
import com.swp391.dichvuchuyennha.entity.Notification;
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
                        .movingType(r.getMovingType()) // 👈 ĐÂY LÀ DÒNG BẠN CẦN THÊM
                        .build())
                .collect(Collectors.toList());
    }

}


