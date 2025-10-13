package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.ServicePriceDTO;
import com.swp391.dichvuchuyennha.mapper.ServicePriceMapper;
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

    public List<ServicePriceDTO> getAllServicePrices() {
        return serviceRepository.findAll()
                .stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
}
