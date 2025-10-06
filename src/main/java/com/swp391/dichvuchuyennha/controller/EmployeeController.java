package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.response.EmployeeDTO;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('manager', 'admin')") // Chỉ manager/admin xem all employees
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAllEmployeeDTO();
    }
}
