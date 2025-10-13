package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.WorkProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkProgressRepository extends JpaRepository<WorkProgress, Integer> {
    List<WorkProgress> findByEmployee_EmployeeId(Integer employeeId);
    Long countByContract_ContractId(Integer contractId);
    List<WorkProgress> findByContract_ContractId(Integer contractId);
    @Query("""
        SELECT wp 
        FROM WorkProgress wp
        WHERE wp.contract.quotation.survey.request.user.userId = :userId
    """)
    List<WorkProgress> findByCustomerUserId(@Param("userId") Integer userId);

    @Query("""
        SELECT wp 
        FROM WorkProgress wp
        WHERE wp.contract.contractId = :contractId
        AND wp.contract.quotation.survey.request.user.userId = :userId
    """)
    List<WorkProgress> findByContractAndCustomer(@Param("contractId") Integer contractId,
                                                 @Param("userId") Integer userId);
//h
}
