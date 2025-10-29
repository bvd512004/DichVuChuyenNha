package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Prices;
import com.swp391.dichvuchuyennha.entity.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PriceRepository extends JpaRepository<Prices, Integer> {
    Optional<Prices> findTopByService_ServiceIdAndPriceTypeContainingAndIsActiveTrueOrderByEffectiveDateDesc(
            Integer serviceId, String priceType);

    List<Prices> findByService_ServiceIdAndPriceTypeContainingAndIsActiveTrue(
            Integer serviceId, String keyword);

    Optional<Prices> findTopByServiceAndIsActiveTrueOrderByEffectiveDateDesc(Services service);
}
