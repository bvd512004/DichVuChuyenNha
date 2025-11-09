package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.dto.response.EmployeeDTO;
import com.swp391.dichvuchuyennha.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    @Query("""
    SELECT new com.swp391.dichvuchuyennha.dto.response.EmployeeDTO(
        e.employeeId,
        u.username,
        e.position
       
    )
    FROM Employee e
    LEFT JOIN e.user u
""")
    List<EmployeeDTO> findAllEmployeeDTO();

    // 🔎 Thêm hàm này để tìm nhân viên từ userId trong JWT
    Optional<Employee> findByUser_UserId(Long userId);
    List<Employee> findByPosition(String position);

    List<Employee> findByPositionAndStatus(String position, String status);
    Optional<Employee> findByUser_Username(String username);

 
    @Query("""
    SELECT new com.swp391.dichvuchuyennha.dto.response.EmployeeDTO(
        e.employeeId,
        u.username,
        e.position
    )
    FROM Employee e
    LEFT JOIN e.user u
    WHERE e.status = 'free'
""")
    List<EmployeeDTO> findFreeEmployeeDTO();

    @Query("""
        SELECT e FROM Employee e
        LEFT JOIN FETCH e.user u
        WHERE LOWER(e.position) LIKE LOWER(CONCAT('%', :position, '%'))
        AND (e.status IS NULL OR LOWER(e.status) = LOWER(:status))
    """)
    List<Employee> findDriversWithStatus(String position, String status);

}//end