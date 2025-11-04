package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.PriceCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.PriceDTO;
import com.swp391.dichvuchuyennha.dto.response.ServicePriceDTO;
import com.swp391.dichvuchuyennha.entity.Prices;
import com.swp391.dichvuchuyennha.entity.Services;
import com.swp391.dichvuchuyennha.mapper.ServicePriceMapper;
import com.swp391.dichvuchuyennha.repository.PriceRepository;
import com.swp391.dichvuchuyennha.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class PriceService {
    private final ServiceRepository serviceRepository;
    private final ServicePriceMapper mapper;
    private final PriceRepository priceRepository;

    public List<ServicePriceDTO> getAllServicePrices() {
        return serviceRepository.findAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
    public ServicePriceDTO getServicePriceById(Integer id) {
        Services service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với id: " + id));

        return mapper.toDTO(service);
    }
    public ServicePriceDTO createService(ServicePriceDTO dto) {
        Services service = new Services();
        service.setServiceName(dto.getServiceName());
        service.setDescription(dto.getDescription());
        service.setImageUrl(dto.getImageUrl());
        service.setIsActive(true); // mặc định bật

        Services saved = serviceRepository.save(service);
        return mapper.toDTO(saved);
    }
    public PriceDTO createPrice(PriceCreateRequest request) {
        Services service = serviceRepository.findById(Integer.parseInt(request.getServiceId()))
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Prices price = Prices.builder()
                .priceType(request.getPriceType())
                .amount(request.getAmount())
                .unit(request.getUnit())
                .service(service)
                .isActive(true) // ✅ Mặc định giá mới là đang hoạt động

                .build();

        priceRepository.save(price);
        return mapper.toPriceDTOs(List.of(price)).get(0);
    }

}
