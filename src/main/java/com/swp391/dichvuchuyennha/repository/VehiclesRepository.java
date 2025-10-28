package com.swp391.dichvuchuyennha.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.swp391.dichvuchuyennha.entity.Vehicles;
import java.util.List;

@Repository
public interface VehiclesRepository extends JpaRepository<Vehicles, Integer> {
    List<Vehicles> findByStatus(String status);
}