package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.CustomerCompanyRequest;
import com.swp391.dichvuchuyennha.dto.request.UserCreateRequest;
import com.swp391.dichvuchuyennha.dto.request.UserUpdateRequest;
import com.swp391.dichvuchuyennha.dto.response.UserResponse;
import com.swp391.dichvuchuyennha.entity.CustomerCompany;
import com.swp391.dichvuchuyennha.entity.Roles;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.mapper.UserMapper;
import com.swp391.dichvuchuyennha.repository.CustomerCompanyRepository;
import com.swp391.dichvuchuyennha.repository.RoleRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CustomerCompanyRepository customerCompanyRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    public UserResponse updateUser(Integer userId, UserUpdateRequest request) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Users saved = userRepository.save(user);
        return UserResponse.builder()
                .userId(saved.getUserId())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .phone(saved.getPhone())
                .roleName(saved.getRole() != null ? saved.getRole().getRoleName() : null)
                .build();
    }

    public List<UserResponse> getAllUsers() {
        List<Users> users = userRepository.findAll();

        return users.stream().map(user ->
                UserResponse.builder()
                        .userId(user.getUserId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                        .build()
        ).collect(Collectors.toList());
    }
    public UserResponse createUser(UserCreateRequest request) {
        // check duplicate username & email
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // map từ request sang entity
        Users user = userMapper.toUsersCreateRequest(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        Users savedUser = userRepository.save(user);

        return userMapper.toUserResponse(savedUser);
    }

    public UserResponse createCustomerCompanyUser(CustomerCompanyRequest req) {
        // check duplicate
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles customerCompanyRole = roleRepository.findByRoleName("customer_company")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        Users user = new Users();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setRole(customerCompanyRole);

        Users savedUser = userRepository.save(user);

        CustomerCompany customerCompany = new CustomerCompany();
        customerCompany.setUser(savedUser);
        customerCompany.setCompanyName(req.getCompanyName());
        customerCompany.setTaxCode(req.getTaxCode());
        customerCompany.setAddress(req.getAddress());
        customerCompany.setEmail(req.getEmail());
        customerCompany.setPhone(req.getPhone());

        customerCompanyRepository.save(customerCompany);

        return userMapper.toUserResponse(savedUser);
    }
    public UserResponse updateUser(Integer userId, UserCreateRequest request) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Check duplicate email nếu khác user hiện tại
        if (!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(role);

        // Nếu có password mới thì encode lại
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Users updatedUser = userRepository.save(user);
        return userMapper.toUserResponse(updatedUser);
    }

    public void deleteUser(Integer userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userRepository.delete(user);
    }


}
