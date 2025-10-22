package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeePositionService {

    private final UserRepository usersRepository;

    public boolean hasPositionSurveyer(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return false;
        String username = authentication.getName();
        Users user = usersRepository.findByUsername(username).orElse(null);
        return user != null
                && user.getEmployee() != null
                && "Surveyer".equalsIgnoreCase(user.getEmployee().getPosition());
    }
}
