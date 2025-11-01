package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Damages;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DamagesRepository extends JpaRepository<Damages, Integer> {
    List<Damages> findByContract_ContractId(Integer contractId);
}
