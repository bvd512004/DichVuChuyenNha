package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.FeedbackRequest;
import com.swp391.dichvuchuyennha.dto.response.FeedbackResponse;
import com.swp391.dichvuchuyennha.entity.Feedbacks;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.repository.FeedbackRepository;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;

    /**
     * Xử lý gửi feedback từ khách hàng sau khi thanh toán thành công
     */
    public FeedbackResponse submitFeedback(FeedbackRequest feedbackRequest, Integer userId) {
        // Lấy contract từ contractId
        Contract contract = contractRepository.findById(feedbackRequest.getContractId())
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        // Lấy user từ userId
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Tạo và lưu feedback
        Feedbacks feedback = new Feedbacks();
        feedback.setContract(contract);
        feedback.setUser(user);
        feedback.setRating(feedbackRequest.getRating());
        feedback.setComment(feedbackRequest.getComment());
        feedback.setCreatedAt(LocalDateTime.now());

        feedbackRepository.save(feedback);

        // Chuyển đổi sang FeedbackResponse
        return new FeedbackResponse(
                feedback.getFeedbackId(),
                feedback.getContract().getContractId(),
                feedback.getUser().getUserId(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getCreatedAt()
        );
    }
    public List<FeedbackResponse> getAllFeedbacks() {
        List<Feedbacks> feedbacks = feedbackRepository.findAll(); // Lấy tất cả feedbacks từ cơ sở dữ liệu

        // Chuyển đổi danh sách feedbacks thành FeedbackResponse
        return feedbacks.stream().map(feedback -> new FeedbackResponse(
                feedback.getFeedbackId(),
                feedback.getContract().getContractId(),
                feedback.getUser().getUserId(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getCreatedAt()
        )).collect(Collectors.toList());
    }
}
