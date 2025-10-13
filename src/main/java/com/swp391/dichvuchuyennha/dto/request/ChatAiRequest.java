package com.swp391.dichvuchuyennha.dto.request;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class ChatAiRequest {
    private String message;
}
