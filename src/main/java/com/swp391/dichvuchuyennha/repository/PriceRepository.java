package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Prices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PriceRepository extends JpaRepository <Prices,Integer> {
}
