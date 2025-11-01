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
    private final QuotationMapper quotationMapper;

    // Lấy tất cả quotation để hiển thị cho quản lý duyệt
    public List<QuotationResponse> getReviewQuotations() {
        return quotationRepository.findAll()
                .stream()
                .map(quotationMapper::toResponse)
                .collect(Collectors.toList());
    }

    // Duyệt báo giá → khách hàng sẽ nhận được PENDING
    public QuotationResponse approveReviewQuotation(Integer quotationId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quotation với ID: " + quotationId));

        quotation.setStatus("PENDING"); // chuyển sang PENDING
        quotationRepository.save(quotation);

        return quotationMapper.toResponse(quotation);
    }

    // Từ chối báo giá → nhân viên khảo sát chỉnh sửa lại
    public QuotationResponse rejectReviewQuotation(Integer quotationId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quotation với ID: " + quotationId));

        quotation.setStatus("REVIEW"); // để nhân viên khảo sát chỉnh sửa
        quotationRepository.save(quotation);

        return quotationMapper.toResponse(quotation);
    }
}

