package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Prices;
import com.swp391.dichvuchuyennha.entity.QuotationServices;
import com.swp391.dichvuchuyennha.entity.Quotations;
import com.swp391.dichvuchuyennha.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationServiceRepository extends JpaRepository<QuotationServices,Integer> {
    List<QuotationServices> findByQuotation(Quotations quotation);
    Optional<QuotationServices> findByQuotationAndServiceAndPrice(
            Quotations quotation,
            Services service,
            Prices price
    );
    List<QuotationServices> findByQuotation_Survey_Request_User_UserIdAndQuotation_Status(Integer userId, String status);

}
