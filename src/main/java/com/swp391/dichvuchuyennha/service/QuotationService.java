package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.QuotationCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.QuotationForCustomer;
import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.entity.Surveys;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.mapper.QuotationForCustomerMapper;
import com.swp391.dichvuchuyennha.mapper.QuotationMapper;
import com.swp391.dichvuchuyennha.repository.QuotationRepository;
import com.swp391.dichvuchuyennha.repository.QuotationServiceRepository;
import com.swp391.dichvuchuyennha.repository.SurveyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final SurveyRepository surveyRepository;
    private final QuotationServiceRepository quotationServiceRepository;
    private final QuotationMapper quotationMapper;
    private final QuotationForCustomerMapper quotationForCustomerMapper;
    private final NotificationService notificationService;
    private QuotationSvService quotationSvService;

    public Quotations createQuotation(QuotationCreateRequest request) {
        // Map từ DTO -> Entity (chưa có survey)
        Quotations quotation = quotationMapper.toEntity(request);

        // Gán survey từ DB theo surveyId
        Surveys survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        quotation.setSurvey(survey);
        quotation.setTotalPrice(0.0);
        // Cập nhật trạng thái thành PENDING
        quotation.setStatus("DRAFT");
        // ✅ Cập nhật status dựa trên tổng tiền
        survey.setStatus("QUOTED");
        // Lưu vào DB
        return quotationRepository.save(quotation);
    }

    public List<QuotationResponse> getQuotationsByCurrentEmployee() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return quotationRepository.findBySurvey_Request_AssignedEmployees_Employee_User_Username(username)
                .stream()
                .map(quotationMapper::toResponse)
                .collect(Collectors.toList());
    }


    public List<QuotationForCustomer> getPendingQuotationsByUserId(Integer userId) {
        // Lấy danh sách quotations PENDING của user
        List<Quotations> quotations = quotationRepository
                .findBySurvey_Request_User_UserIdAndStatus(userId, "PENDING");

        return quotations.stream()
                .map(quotationForCustomerMapper::toInfo)
                .collect(Collectors.toList());
    }

    public QuotationForCustomer approveQuotation(Integer quotationId, Integer userId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (!quotation.getSurvey().getRequest().getUser().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!"PENDING".equalsIgnoreCase(quotation.getStatus())) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        }

        quotation.setStatus("APPROVED");
        quotationRepository.save(quotation);

        return quotationForCustomerMapper.toInfo(quotation);
    }

    public QuotationForCustomer rejectQuotation(Integer quotationId, Integer userId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (!quotation.getSurvey().getRequest().getUser().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (!"PENDING".equalsIgnoreCase(quotation.getStatus())) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        }

        quotation.setStatus("REJECTED");
        quotationRepository.save(quotation);

        return quotationForCustomerMapper.toInfo(quotation);
    }
}