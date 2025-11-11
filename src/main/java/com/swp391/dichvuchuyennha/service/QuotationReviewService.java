package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.QuotationResponse;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.mapper.QuotationMapper;
import com.swp391.dichvuchuyennha.repository.QuotationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuotationReviewService {

    private final QuotationRepository quotationRepository;
    private final QuotationMapper quotationMapper;

    // Lấy tất cả quotation để hiển thị cho quản lý duyệt
    @Transactional(readOnly = true)
    public List<QuotationResponse> getReviewQuotations() {
        try {
            // CHỈ LẤY NHỮNG BÁO GIÁ ĐANG Ở TRẠNG THÁI REVIEWED
            List<Quotations> quotations = quotationRepository.findByStatus("REVIEWED");

            return quotations.stream()
                    .filter(quotation -> {
                        try {
                            return quotation != null &&
                                    quotation.getSurvey() != null &&
                                    quotation.getSurvey().getRequest() != null;
                        } catch (Exception e) {
                            log.warn("Lỗi khi kiểm tra quotation ID {}: {}",
                                    quotation != null ? quotation.getQuotationId() : "null", e.getMessage());
                            return false;
                        }
                    })
                    .map(quotation -> {
                        try {
                            // Force load các quan hệ lazy để tránh LazyInitializationException
                            if (quotation.getQuotationServices() != null) {
                                quotation.getQuotationServices().size();
                            }
                            if (quotation.getSurvey() != null && quotation.getSurvey().getRequest() != null) {
                                var request = quotation.getSurvey().getRequest();
                                if (request.getAssignedEmployees() != null) {
                                    request.getAssignedEmployees().size();
                                }
                                if (request.getUser() != null) {
                                    request.getUser().getUserId(); // load user
                                    if (request.getUser().getCustomerCompany() != null) {
                                        request.getUser().getCustomerCompany().getCompanyName();
                                    }
                                }
                            }
                            return quotationMapper.toResponse(quotation);
                        } catch (Exception e) {
                            log.error("Lỗi khi map quotation ID {}: {}", quotation.getQuotationId(), e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách báo giá chờ duyệt: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi lấy danh sách báo giá chờ duyệt", e);
        }
    }
    // Duyệt báo giá → khách hàng sẽ nhận được PENDING
    public QuotationResponse approveReviewQuotation(Integer quotationId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quotation với ID: " + quotationId));

        quotation.setStatus("PENDING");

        quotationRepository.save(quotation);

        return quotationMapper.toResponse(quotation);
    }

    // Từ chối báo giá → nhân viên khảo sát chỉnh sửa lại
    public QuotationResponse rejectReviewQuotation(Integer quotationId, String reason) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quotation với ID: " + quotationId));

        quotation.setStatus("REJECTED");
        quotation.setReason(reason);
        quotationRepository.save(quotation);

        return quotationMapper.toResponse(quotation);
    }

}

