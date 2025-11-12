package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Invoices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoices, Integer> {
}
