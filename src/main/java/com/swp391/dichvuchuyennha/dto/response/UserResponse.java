package com.swp391.dichvuchuyennha.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Integer userId;
    private String username;
    private String email;
    private String phone;
    private Integer roleId;     // Có thể null
    private String roleName;    // Có thể null
}