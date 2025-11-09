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
            List<Quotations> quotations = quotationRepository.findAll();
            return quotations.stream()
                    .filter(quotation -> {
                        // Kiểm tra quotation có dữ liệu hợp lệ không
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
                            // Đảm bảo các lazy collections được load trong transaction
                            if (quotation.getQuotationServices() != null) {
                                quotation.getQuotationServices().size(); // Force load
                            }
                            if (quotation.getSurvey() != null && quotation.getSurvey().getRequest() != null) {
                                if (quotation.getSurvey().getRequest().getAssignedEmployees() != null) {
                                    quotation.getSurvey().getRequest().getAssignedEmployees().size(); // Force load
                                }
                                if (quotation.getSurvey().getRequest().getUser() != null) {
                                    // Force load user và customer company
                                    quotation.getSurvey().getRequest().getUser().getUserId();
                                    if (quotation.getSurvey().getRequest().getUser().getCustomerCompany() != null) {
                                        quotation.getSurvey().getRequest().getUser().getCustomerCompany().getCompanyName();
                                    }
                                }
                            }
                            return quotationMapper.toResponse(quotation);
                        } catch (Exception e) {
                            log.error("Lỗi khi map quotation ID {}: {}", 
                                    quotation.getQuotationId(), e.getMessage(), e);
                            return null;
                        }
                    })
                    .filter(response -> response != null)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách quotations: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi khi lấy danh sách báo giá: " + e.getMessage(), e);
        }
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

        quotation.setStatus("REJECTED"); // để nhân viên khảo sát chỉnh sửa
        quotationRepository.save(quotation);

        return quotationMapper.toResponse(quotation);
    }
}

