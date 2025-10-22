package com.swp391.dichvuchuyennha.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class ChatAiRequest {
    @NotBlank(message = "Message không được để trống")
    private String message;
    
    private List<String> images; // Base64 encoded images
}
