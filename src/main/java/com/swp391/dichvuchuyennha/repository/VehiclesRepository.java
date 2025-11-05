package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Vehicles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehiclesRepository extends JpaRepository<Vehicles, Integer> {
    
    // Lấy danh sách xe có sẵn (chưa được gán cho quotation nào hoặc status = AVAILABLE)
    @Query("SELECT v FROM Vehicles v WHERE v.quotation IS NULL OR v.status = 'AVAILABLE'")
    List<Vehicles> findAvailableVehicles();
    
    // Lấy xe đã được gán cho quotation
    List<Vehicles> findByQuotation_QuotationId(Integer quotationId);
    
    // Lấy xe theo vehicleId và kiểm tra quotation
    Optional<Vehicles> findByVehicleId(Integer vehicleId);
}