package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.AssignmentVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssignmentVehicleRepository extends JpaRepository<AssignmentVehicle, Integer> {
    
    // Lấy danh sách xe đã được gán cho hợp đồng
    List<AssignmentVehicle> findByContractContractId(Integer contractId);
    
    // Kiểm tra xe đã được gán vào hợp đồng khác trong ngày cụ thể chưa
    @Query("SELECT av FROM AssignmentVehicle av WHERE av.vehicle.vehicleId = :vehicleId AND av.assignDate = :assignDate")
    List<AssignmentVehicle> findAssignmentsByVehicleAndDate(@Param("vehicleId") Integer vehicleId, @Param("assignDate") LocalDate assignDate);
    
    // Xóa gán xe khỏi hợp đồng
    void deleteByContractContractIdAndVehicleVehicleId(Integer contractId, Integer vehicleId);
}

