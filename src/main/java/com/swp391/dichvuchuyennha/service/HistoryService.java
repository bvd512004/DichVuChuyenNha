//package com.swp391.dichvuchuyennha.service;
//
//import com.swp391.dichvuchuyennha.dto.response.ContractResponse;
//import com.swp391.dichvuchuyennha.dto.response.FeedbackResponse;
//import com.swp391.dichvuchuyennha.dto.response.PaymentResponse;
//import com.swp391.dichvuchuyennha.dto.response.RequestResponse;
//import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;
//import com.swp391.dichvuchuyennha.entity.Users;
//import com.swp391.dichvuchuyennha.repository.ContractRepository;
//import com.swp391.dichvuchuyennha.repository.FeedbacksRepository; // Assume exists
//import com.swp391.dichvuchuyennha.repository.PaymentRepository; // Assume exists
//import com.swp391.dichvuchuyennha.repository.RequestRepository;
//import com.swp391.dichvuchuyennha.repository.UserRepository;
//import com.swp391.dichvuchuyennha.repository.WorkProgressRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@Service
//@RequiredArgsConstructor
//public class HistoryService {
//
//    private final UserRepository userRepository;
//    private final RequestRepository requestRepository;
//    private final ContractRepository contractRepository;
//    private final PaymentRepository paymentRepository;
//    private final FeedbacksRepository feedbacksRepository;
//    private final WorkProgressRepository workProgressRepository;
//
//    public Map<String, Object> getUserHistory(Integer userId) {
//        Users user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        List<RequestResponse> requests = requestRepository.findByUser(user)
//                .stream().map(r -> RequestResponse.builder() // map to DTO
//                        .requestId(r.getRequestId())
//                        .status(r.getStatus())
//                        .description(r.getDescription())
//                        .requestTime(r.getRequestTime())
//                        .pickupAddress(r.getPickupAddress())
//                        .destinationAddress(r.getDestinationAddress())
//                        .movingDay(r.getMovingDay())
//                        .build())
//                .toList();
//
//        List<ContractResponse> contracts = contractRepository.findBySignedBy(user)
//                .stream().map(c -> ContractResponse.builder() // map to DTO
//                        .contractId(c.getContractId())
//                        .startDate(c.getStartDate())
//                        .endDate(c.getEndDate())
//                        .depositAmount(c.getDepositAmount())
//                        .totalAmount(c.getTotalAmount())
//                        .status(c.getStatus())
//                        .signedDate(c.getSignedDate())
//                        .signedById(c.getSignedBy().getUserId())
//                        .signedByUsername(c.getSignedBy().getUsername())
//                        .startLocation(c.getQuotation().getSurvey().getAddressFrom())
//                        .endLocation(c.getQuotation().getSurvey().getAddressTo())
//                        .build())
//                .toList();
//
//        List<PaymentResponse> payments = paymentRepository
//                .findByContractIn(contracts.stream().map(Contract::getContractId).toList())
//                .stream()
//                .map(p -> new PaymentResponse(p.getPaymentId(), p.getAmount(), p.getPaymentDate(), p.getMethod(),
//                        p.getStatus()))
//                .toList(); // Assume PaymentResponse DTO
//
//        List<FeedbackResponse> feedbacks = feedbacksRepository.findByUser(user)
//                .stream()
//                .map(f -> new FeedbackResponse(f.getFeedbackId(), f.getRating(), f.getComment(), f.getCreatedAt()))
//                .toList(); // Assume DTO
//
//        List<WorkProgressResponse> progress = workProgressRepository
//                .findByContractIn(contracts.stream().map(Contract::getContractId).toList())
//                .stream()
//                .map(wp -> new WorkProgressResponse(wp.getProgressId(), wp.getContract().getContractId(),
//                        wp.getEmployee().getEmployeeId(), wp.getTaskDescription(), wp.getProgressStatus(),
//                        wp.getUpdatedAt()))
//                .toList();
//
//        Map<String, Object> history = new HashMap<>();
//        history.put("requests", requests);
//        history.put("contracts", contracts);
//        history.put("payments", payments);
//        history.put("feedbacks", feedbacks);
//        history.put("progress", progress);
//
//        return history;
//    }
//}