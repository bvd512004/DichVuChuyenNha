package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Integer> {

    // Tìm hợp đồng theo userId của request và trạng thái
    List<Contract> findByQuotation_Survey_Request_User_UserIdAndStatus(Integer userId, String status);
    List<Contract> findByStatus(String status);
    @Query(value = """
        SELECT r.moving_day
        FROM contract c
        JOIN quotations q ON c.quotation_id = q.quotation_id
        JOIN surveys s ON q.survey_id = s.survey_id
        JOIN requests r ON s.request_id = r.request_id
        WHERE c.contract_id = :contractId
        LIMIT 1
    """, nativeQuery = true)
    Date findMovingDayByContractId(@Param("contractId") Integer contractId);


}
