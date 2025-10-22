package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.mapper.QuotationForCustomerMapper;
import com.swp391.dichvuchuyennha.mapper.QuotationMapper;
import com.swp391.dichvuchuyennha.repository.QuotationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationReviewService {

    private final QuotationRepository quotationRepository;
    private final QuotationForCustomerMapper quotationForCustomerMapper;
    private final QuotationMapper quotationMapper;

    public List<QuotationResponse> getReviewQuotations() {
        return quotationRepository.findAll()
                .stream()
                .map(quotationMapper::toResponse)
                .collect(Collectors.toList());
    }

    public QuotationResponse approveReviewQuotation(Integer quotationId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quotation với ID: " + quotationId));

        if (!"REVIEW".equalsIgnoreCase(quotation.getStatus())) {
            throw new IllegalStateException("Chỉ có quotation ở trạng thái REVIEW mới được xử lý");
        }

        quotation.setStatus("PENDING"); // Chuyển sang PENDING
        quotationRepository.save(quotation);

        return quotationMapper.toResponse(quotation);
    }
    public QuotationResponse rejectReviewQuotation(Integer quotationId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quotation với ID: " + quotationId));

        if (!"REVIEW".equalsIgnoreCase(quotation.getStatus())) {
            throw new IllegalStateException("Chỉ có quotation ở trạng thái REVIEW mới được từ chối.");
        }

        quotation.setStatus("REJECTED"); // Chuyển sang REJECTED
        quotationRepository.save(quotation);

        return quotationMapper.toResponse(quotation);
    }
}

