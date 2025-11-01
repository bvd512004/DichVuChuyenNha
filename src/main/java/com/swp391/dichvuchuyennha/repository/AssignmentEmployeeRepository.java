package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.AssignmentEmployee;
import com.swp391.dichvuchuyennha.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

import java.util.Date;
import java.util.List;

@Repository
public interface AssignmentEmployeeRepository extends JpaRepository<AssignmentEmployee, Integer> {

    // Find assignments by employee
    List<AssignmentEmployee> findByEmployeeEmployeeId(Integer employeeId);

    // Find assignments by contract
    List<AssignmentEmployee> findByContractContractId(Integer contractId);

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

    // Find assignments with employee and contract details
    @Query("""
        SELECT ae FROM AssignmentEmployee ae
        LEFT JOIN FETCH ae.employee e
        LEFT JOIN FETCH e.user u
        LEFT JOIN FETCH ae.contract c
        WHERE ae.employee.employeeId = :employeeId
        ORDER BY ae.assignedTime DESC
    """)
    List<AssignmentEmployee> findByEmployeeEmployeeIdWithDetails(@Param("employeeId") Integer employeeId);

    // Kiểm tra nếu nhân viên đã được gán vào hợp đồng trong ngày assignDate
    @Query("""
        SELECT ae FROM AssignmentEmployee ae
        WHERE ae.employee.employeeId = :employeeId AND ae.assignDate = :assignDate
    """)
    List<AssignmentEmployee> findAssignmentsByEmployeeAndDate(@Param("employeeId") Integer employeeId, @Param("assignDate") LocalDate assignDate);

    // Kiểm tra sự tồn tại của hợp đồng
    List<AssignmentEmployee> findByContract_ContractId(Integer contractId);

    // Kiểm tra nếu hợp đồng đã tồn tại
    boolean existsByContract_ContractId(Integer contractId);
    boolean existsByEmployeeAndContract_Quotation_Survey_Request_MovingDay(Employee employee, Date movingDay);

}
// fix sạch

