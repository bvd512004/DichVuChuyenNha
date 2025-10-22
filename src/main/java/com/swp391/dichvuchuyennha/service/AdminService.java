package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.EmployeeCreateRequest;
import com.swp391.dichvuchuyennha.dto.request.UserCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.UserResponse;
import com.swp391.dichvuchuyennha.entity.Employee;
import com.swp391.dichvuchuyennha.entity.Roles;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import com.swp391.dichvuchuyennha.repository.RoleRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;

    private final PasswordEncoder passwordEncoder; // inject bean từ config

    /**
     * Tạo user chung
     */
    public UserResponse createUser(UserCreateRequest request) {
        // check duplicate username/email/phone
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }


        Roles role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(role);

        Users savedUser = userRepository.save(user);

        return UserResponse.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .roleName(role.getRoleName())
                .build();
    }

    /**
     * Tạo user + employee
     */
    public UserResponse createEmployeeUser(EmployeeCreateRequest req) {
        // check duplicate
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }


        Roles employeeRole = roleRepository.findByRoleName("employee")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // create user
        Users user = new Users();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setRole(employeeRole);

        Users savedUser = userRepository.save(user);

        // create employee
        Employee employee = new Employee();
        employee.setUser(savedUser);
        employee.setPosition(req.getPosition());
        employee.setPhone(req.getPhone()); // 👈 thêm dòng này
        employee.setStatus("FREE");
        employeeRepository.save(employee);

        return UserResponse.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .roleName(employeeRole.getRoleName())
                .build();
    }
}
