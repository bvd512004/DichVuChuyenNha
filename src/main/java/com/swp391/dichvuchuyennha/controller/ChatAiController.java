package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.ApiResponse;
import com.swp391.dichvuchuyennha.dto.request.ChatAiRequest;
import com.swp391.dichvuchuyennha.service.ChatAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ChatAiController {
    private final ChatAiService chatAiService;

    @PostMapping("/chat-ai")
    public ApiResponse<Object> ChatAi(@Valid @RequestBody ChatAiRequest chatAiRequest) {

        return ApiResponse.builder()
                .code(1000)
                .result(chatAiService.sendMessage(chatAiRequest))
                .build();

    }
}
