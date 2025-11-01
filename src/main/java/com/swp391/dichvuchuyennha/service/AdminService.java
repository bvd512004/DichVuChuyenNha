package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.EmployeeCreateRequest;
import com.swp391.dichvuchuyennha.dto.request.UserCreateRequest;
import com.swp391.dichvuchuyennha.dto.request.VehicleCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.*;
import com.swp391.dichvuchuyennha.entity.*;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.mapper.UserMapper;
import com.swp391.dichvuchuyennha.mapper.VehicleMapper;
import com.swp391.dichvuchuyennha.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final VehiclesRepository vehiclesRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final VehicleMapper vehicleMapper;

    // Lấy user đang thực hiện hành động (ADMIN) - DỰA TRÊN JWT
    private Users getCurrentAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }

        String username = null;
        Object principal = auth.getPrincipal();

        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        }

        return username != null ? userRepository.findByUsername(username).orElse(null) : null;
    }

    // Lấy IP an toàn - DÙNG jakarta.servlet (Spring Boot 3)
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                var request = attributes.getRequest();
                String ip = request.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getHeader("X-Real-IP");
                }
                if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
                    ip = request.getRemoteAddr();
                }
                return ip != null ? ip.split(",")[0].trim() : "unknown";
            }
        } catch (Exception e) {
            // Ignore - chạy trong test hoặc background job
        }
        return "unknown";
    }

    // Log audit - KHÔNG DÙNG javax.servlet, KHÔNG CRASH
    private void logAction(String action, String entity, Integer entityId, String details) {
        Users admin = getCurrentAdmin();
        String ip = getClientIp();

        AuditLog log = new AuditLog();
        log.setUser(admin);
        log.setAction(action);
        log.setEntity(entity);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setIpAddress(ip);
        log.setCreatedAt(LocalDateTime.now());

        auditLogRepository.save(log);
    }

    // === CÁC PHƯƠNG THỨC CHÍNH ===
    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        Users user = userMapper.toUsersCreateRequest(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        Users savedUser = userRepository.save(user);

        logAction("CREATE_USER", "USER", savedUser.getUserId(),
                "Created user: " + savedUser.getUsername() + " | Role: " + role.getRoleName());

        return userMapper.toUserResponse(savedUser);
    }

    @Transactional
    public UserResponse createEmployeeUser(EmployeeCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles role = roleRepository.findByRoleName("EMPLOYEE")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(role);

        Users savedUser = userRepository.save(user);

        Employee employee = new Employee();
        employee.setUser(savedUser);
        employee.setPosition(request.getPosition());
        employee.setPhone(request.getPhone());
        employee.setStatus("ACTIVE");
        employeeRepository.save(employee);

        logAction("CREATE_EMPLOYEE", "EMPLOYEE", employee.getEmployeeId(),
                "Created employee: " + savedUser.getUsername() + " | Position: " + request.getPosition());

        return userMapper.toUserResponse(savedUser);
    }

    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(r -> new RoleResponse(r.getRoleId(), r.getRoleName()))
                .collect(Collectors.toList());
    }

    public List<VehicleResponse> getAllVehicles() {
        return vehiclesRepository.findAll().stream()
                .map(vehicleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponse createVehicle(VehicleCreateRequest request) {
        Vehicles vehicle = vehicleMapper.toEntity(request);
        Vehicles saved = vehiclesRepository.save(vehicle);

        logAction("CREATE_VEHICLE", "VEHICLE", saved.getVehicleId(),
                "Created vehicle: " + saved.getLicensePlate());

        return vehicleMapper.toResponse(saved);
    }

    @Transactional
    public VehicleResponse updateVehicle(Integer id, VehicleCreateRequest request) {
        Vehicles vehicle = vehiclesRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_NOT_FOUND));

        vehicleMapper.updateFromRequest(request, vehicle);
        Vehicles saved = vehiclesRepository.save(vehicle);

        logAction("UPDATE_VEHICLE", "VEHICLE", id,
                "Updated vehicle: " + saved.getLicensePlate());

        return vehicleMapper.toResponse(saved);
    }

    @Transactional
    public void deleteVehicle(Integer id) {
        if (!vehiclesRepository.existsById(id)) {
            throw new AppException(ErrorCode.VEHICLE_NOT_FOUND);
        }
        vehiclesRepository.deleteById(id);
        logAction("DELETE_VEHICLE", "VEHICLE", id, "Deleted vehicle ID: " + id);
    }

    public List<LoginHistoryResponse> getLoginHistory(Integer userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return loginHistoryRepository.findByUser(user).stream()
                .map(h -> new LoginHistoryResponse(
                        h.getLoginTime(),
                        h.getLogoutTime(),
                        h.getIpAddress(),
                        h.getUserAgent(),  // ĐÃ THÊM
                        h.getStatus()
                ))
                .collect(Collectors.toList());
    }

    public List<AuditLogResponse> getAuditLogs() {
        return auditLogRepository.findAll().stream()
                .map(log -> new AuditLogResponse(
                        log.getLogId(),
                        log.getUser() != null ? log.getUser().getUsername() : "SYSTEM",
                        log.getAction(),
                        log.getEntity(),
                        log.getEntityId(),
                        log.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    // === USER MANAGEMENT ===
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUser(Integer userId, UserCreateRequest request) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(role);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Users updated = userRepository.save(user);
        logAction("UPDATE_USER", "USER", userId, "Updated user: " + user.getUsername());

        return userMapper.toUserResponse(updated);
    }

    @Transactional
    public void deleteUser(Integer userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userRepository.delete(user);
        logAction("DELETE_USER", "USER", userId, "Deleted user ID: " + userId);
    }
}