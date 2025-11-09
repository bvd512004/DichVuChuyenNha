package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.response.DriverScheduleResponse;
import com.swp391.dichvuchuyennha.service.VehiclesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DriverController {

    private final VehiclesService vehiclesService;

    @GetMapping("/schedule")
    public ResponseEntity<?> getDriverSchedule(JwtAuthenticationToken authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Object userIdClaim = authentication.getTokenAttributes().get("userId");
        if (userIdClaim == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = ((Number) userIdClaim).longValue();
        try {
            List<DriverScheduleResponse> schedules = vehiclesService.getDriverSchedulesForDriver(userId);
            return ResponseEntity.ok(schedules);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        }
    }
}


