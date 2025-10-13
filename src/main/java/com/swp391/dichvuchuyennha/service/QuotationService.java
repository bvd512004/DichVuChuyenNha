package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.QuotationCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.entity.Surveys;
import com.swp391.dichvuchuyennha.mapper.QuotationMapper;
import com.swp391.dichvuchuyennha.repository.QuotationRepository;
import com.swp391.dichvuchuyennha.repository.QuotationServiceRepository;
import com.swp391.dichvuchuyennha.repository.SurveyRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final SurveyRepository surveyRepository;
    private final QuotationMapper mapper;
    public Quotations createQuotation(QuotationCreateRequest request) {
        // Map từ DTO -> Entity (chưa có survey)
        Quotations quotation = mapper.toEntity(request);

        // Gán survey từ DB theo surveyId
        Surveys survey = surveyRepository.findById(request.getSurveyId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khảo sát với ID: " + request.getSurveyId()));

        quotation.setSurvey(survey);
        quotation.setTotalPrice(0.0);

        // Lưu vào DB
        return quotationRepository.save(quotation);
    }

    public List<Quotations> getAllQuotations() {
        return quotationRepository.findAll();
    }

}
