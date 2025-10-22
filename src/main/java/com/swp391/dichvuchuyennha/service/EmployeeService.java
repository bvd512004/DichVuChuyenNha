
package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.EmployeeDTO;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(emp -> new EmployeeDTO(
                        emp.getEmployeeId(),
                        emp.getUser() != null ? emp.getUser().getUsername() : "No user",
                        emp.getPosition()
                ))
                .toList();
    }
    public List<EmployeeDTO> getFreeEmployees() {
        return employeeRepository.findFreeEmployeeDTO();
    }
}// employee sau khi bỏ của dũng

