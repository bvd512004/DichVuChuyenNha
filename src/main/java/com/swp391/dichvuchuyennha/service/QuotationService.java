package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.QuotationCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.QuotationForCustomer;
import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.*;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.mapper.QuotationForCustomerMapper;
import com.swp391.dichvuchuyennha.mapper.QuotationMapper;
import com.swp391.dichvuchuyennha.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final SurveyRepository surveyRepository;
    private final QuotationServiceRepository quotationServiceRepository;
    private final QuotationMapper quotationMapper;
    private final QuotationForCustomerMapper quotationForCustomerMapper;
    private final PriceRepository priceRepository;
    private final ServiceRepository serviceRepository;

    @Transactional
    public Quotations createQuotation(QuotationCreateRequest request) {
        Surveys survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new AppException(ErrorCode.SURVEY_NOT_FOUND));

        if (!"DONE".equalsIgnoreCase(survey.getStatus())) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        }

        // Khởi tạo báo giá
        Quotations quotation = new Quotations();
        quotation.setSurvey(survey);
        quotation.setCreatedAt(LocalDateTime.now());
        quotation.setStatus("DRAFT");

        List<QuotationServices> quotationServices = new ArrayList<>();
        double total = 0.0;

        // === A. Dịch vụ chính (theo m²) ===
        Prices mainPrice = priceRepository.findTopByService_ServiceIdAndPriceTypeContainingAndIsActiveTrueOrderByEffectiveDateDesc(1, "Theo m2").orElse(null);
        if (mainPrice != null && survey.getTotalArea() != null) {
            QuotationServices qs = createQuotationService(quotation, mainPrice, survey.getTotalArea().intValue());
            quotationServices.add(qs);
            total += qs.getSubtotal();
        }

        // === B. Dịch vụ vận chuyển ===
        Prices transportPrice = selectBestTransportPrice(survey);
        if (transportPrice != null) {
            int quantity = transportPrice.getUnit().contains("ngày") ? 1 : survey.getDistanceKm().intValue();
            QuotationServices qs = createQuotationService(quotation, transportPrice, quantity);
            quotationServices.add(qs);
            total += qs.getSubtotal();
        }

        // === C. Dịch vụ bổ sung (từ request) ===
        if (request.getAdditionalServiceIds() != null) {
            for (Integer serviceId : request.getAdditionalServiceIds()) {
                Services service = serviceRepository.findById(serviceId)
                        .orElseThrow(() -> new AppException(ErrorCode.SURVEY_NOT_FOUND));
                Prices price = priceRepository.findTopByServiceAndIsActiveTrueOrderByEffectiveDateDesc(service).orElse(null);
                if (price != null) {
                    QuotationServices qs = createQuotationService(quotation, price, 1);
                    quotationServices.add(qs);
                    total += qs.getSubtotal();
                }
            }
        }

        // Gán dịch vụ + tổng giá
        quotation.setQuotationServices(quotationServices);
        quotation.setTotalPrice(total);
        survey.setStatus("QUOTED");

        return quotationRepository.save(quotation);
    }

    private QuotationServices createQuotationService(Quotations quotation, Prices price, int quantity) {
        QuotationServices qs = new QuotationServices();
        qs.setQuotation(quotation);
        qs.setService(price.getService());
        qs.setPrice(price);
        qs.setQuantity(quantity);
        qs.setSubtotal(price.getAmount() * quantity);
        return qs;
    }

    // --- Chọn xe phù hợp dựa trên loại hình & diện tích ---
    private Prices selectBestTransportPrice(Surveys survey) {
        Double distance = survey.getDistanceKm();
        Double area = survey.getTotalArea();
        String movingType = survey.getRequest().getMovingType();

        if (distance == null || area == null || movingType == null) return null;

        String vehicleType = determineVehicleType(area, movingType);
        if (vehicleType == null) return null;

        List<Prices> candidates = priceRepository.findByService_ServiceIdAndPriceTypeContainingAndIsActiveTrue(3, vehicleType);

        return candidates.stream()
                .filter(p -> p.getUnit().contains("km"))
                .findFirst()
                .orElse(candidates.stream()
                        .filter(p -> p.getUnit().contains("ngày"))
                        .findFirst()
                        .orElse(null));
    }

    private String determineVehicleType(Double area, String movingType) {
        if ("HOUSE".equalsIgnoreCase(movingType)) {
            if (area <= 60) return "xe tải nhỏ";
            if (area <= 150) return "xe tải trung";
            return "container";
        } else if ("OFFICE".equalsIgnoreCase(movingType)) {
            if (area <= 100) return "xe tải nhỏ";
            if (area <= 300) return "xe tải trung";
            return "container";
        }
        return null;
    }

    // --- Các hàm xử lý Quotation khác ---
    public List<QuotationResponse> getQuotationsByCurrentEmployee() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return quotationRepository.findBySurvey_Request_AssignedEmployees_Employee_User_Username(username)
                .stream().map(quotationMapper::toResponse).collect(Collectors.toList());
    }

    public List<QuotationForCustomer> getPendingQuotationsByUserId(Integer userId) {
        return quotationRepository.findBySurvey_Request_User_UserIdAndStatus(userId, "PENDING")
                .stream().map(quotationForCustomerMapper::toInfo).collect(Collectors.toList());
    }

    public QuotationForCustomer approveQuotation(Integer quotationId, Integer userId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (!quotation.getSurvey().getRequest().getUser().getUserId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        if (!"PENDING".equalsIgnoreCase(quotation.getStatus()))
            throw new AppException(ErrorCode.INVALID_STATUS);

        quotation.setStatus("APPROVED");
        quotationRepository.save(quotation);
        return quotationForCustomerMapper.toInfo(quotation);
    }

    public QuotationForCustomer rejectQuotation(Integer quotationId, Integer userId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (!quotation.getSurvey().getRequest().getUser().getUserId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        if (!"PENDING".equalsIgnoreCase(quotation.getStatus()))
            throw new AppException(ErrorCode.INVALID_STATUS);

        quotation.setStatus("REJECTED");
        quotationRepository.save(quotation);
        return quotationForCustomerMapper.toInfo(quotation);
    }
}
