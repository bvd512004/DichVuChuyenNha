package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.QuotationServiceRequest;
import com.swp391.dichvuchuyennha.dto.response.ListQuotationServicesResponse;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.mapper.QuotationServiceMapper;
import com.swp391.dichvuchuyennha.repository.PriceRepository;
import com.swp391.dichvuchuyennha.repository.QuotationRepository;
import com.swp391.dichvuchuyennha.repository.QuotationServiceRepository;
import com.swp391.dichvuchuyennha.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationSvService {

    private final QuotationServiceMapper mapper;
    private final QuotationRepository quotationRepository;
    private final ServiceRepository serviceRepository;
    private final PriceRepository priceRepository;
    private final QuotationServiceRepository quotationServiceRepository;

    public void updateQuotationTotalPrice(Integer quotationId) {
        Quotations quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy quotation với ID: " + quotationId));

        // Lấy danh sách services của quotation
        double total = quotationServiceRepository.findByQuotation(quotation)
                .stream()
                .mapToDouble(s -> s.getSubtotal() != null ? s.getSubtotal() : 0)
                .sum();

        quotation.setTotalPrice(total);
        quotationRepository.save(quotation);
    }

    // Ví dụ khi tạo mới một QuotationService
    public QuotationServices create(QuotationServiceRequest request) {
        Quotations quotation = quotationRepository.findById(request.getQuotationId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy quotation với ID: " + request.getQuotationId()));

        var service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy service với ID: " + request.getServiceId()));

        var price = priceRepository.findById(request.getPriceId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy price với ID: " + request.getPriceId()));

        // ✅ Kiểm tra xem service đã tồn tại trong quotation chưa
        QuotationServices existing = quotationServiceRepository
                .findByQuotationAndServiceAndPrice(quotation, service, price)
                .orElse(null);

        if (existing != null) {
            // Đã tồn tại → cộng dồn quantity
            int newQuantity = existing.getQuantity() + request.getQuantity();
            existing.setQuantity(newQuantity);
            existing.setSubtotal(price.getAmount() * newQuantity);

            QuotationServices updated = quotationServiceRepository.save(existing);
            updateQuotationTotalPrice(quotation.getQuotationId());
            return updated;
        }

        // Chưa có → tạo mới
        QuotationServices entity = mapper.toEntity(request);
        entity.setQuotation(quotation);
        entity.setService(service);
        entity.setPrice(price);
        entity.setQuantity(request.getQuantity());
        entity.setSubtotal((price.getAmount() != null && request.getQuantity() != null)
                ? price.getAmount() * request.getQuantity() : 0);

        QuotationServices saved = quotationServiceRepository.save(entity);
        updateQuotationTotalPrice(quotation.getQuotationId());
        return saved;
    }
    public List<ListQuotationServicesResponse> getAllQuotationServices() {
        List<QuotationServices> quotationServicesList = quotationServiceRepository.findAll();
        return quotationServicesList.stream()
                .map(mapper::toListQuotationServicesResponse)
                .collect(Collectors.toList());
    }
    public QuotationServices updateQuantity(Integer id, Integer quantity) {
        QuotationServices entity = quotationServiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy QuotationService với ID: " + id));

        entity.setQuantity(quantity);

        // Cập nhật subtotal
        if (entity.getPrice() != null && quantity != null) {
            entity.setSubtotal(entity.getPrice().getAmount() * quantity);
        }

        QuotationServices saved = quotationServiceRepository.save(entity);

        // Cập nhật tổng subtotal vào quotation
        updateQuotationTotalPrice(entity.getQuotation().getQuotationId());

        return saved;
    }

    // Xóa dịch vụ
    public void delete(Integer id) {
        QuotationServices entity = quotationServiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy QuotationService với ID: " + id));

        Integer quotationId = entity.getQuotation().getQuotationId();
        quotationServiceRepository.delete(entity);

        // Cập nhật tổng subtotal vào quotation
        updateQuotationTotalPrice(quotationId);
    }

}
