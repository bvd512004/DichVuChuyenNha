package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.QuotationForCustomer;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.mapper.QuotationServiceMapper;
import com.swp391.dichvuchuyennha.repository.QuotationServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class QuotationForCustomerService {
    private final QuotationServiceRepository quotationServiceRepository;
    private final QuotationServiceMapper quotationServiceMapper;
//    public List<QuotationForCustomer> getAllQuotationPending(Integer userId){
//    List<QuotationServices> quotationServices = quotationServiceRepository.findByQuotation_Survey_Request_UserIdAndStatus(userId);
//
//
//    }
}
