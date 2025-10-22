package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.ChatAiRequest;
import com.swp391.dichvuchuyennha.dto.response.ChatAiResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class ChatAiService {

    private final ChatClient chatClient;
    private final RestTemplate restTemplate;
    
    @Value("${spring.ai.openai.api-key}")
    private String apiKey;
    
    @Autowired
    public ChatAiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
        this.restTemplate = new RestTemplate();
    }

    public ChatAiResponse sendMessage(ChatAiRequest request) {

        if ((request.getMessage() == null || request.getMessage().trim().isEmpty()) 
            && (request.getImages() == null || request.getImages().isEmpty())) {
            throw new IllegalArgumentException("Message hoặc hình ảnh không được để trống");
        }

        String systemPrompt = "Bạn là một hệ thống của dịch vụ vận chuyển nhà với các gói dịch vụ cơ bản. " +
                "Dưới đây là một bảng service dịch vụ của hệ thống:\n" +
                "price_id\tservice_id\tprice_type\tamount\tunit\teffective_date\tis_active\n" +
                "1\t1\tTheo m2\t50000\tm2\t2025-01-01\t1\n" +
                "2\t1\tNhân công\t120000\tngười\t2025-01-01\t1\n" +
                "3\t1\tTheo chuyến\t300000\tchuyến\t2025-01-01\t1\n" +
                "4\t2\tTheo phòng\t250000\tphòng\t2025-01-01\t1\n" +
                "5\t2\tNhân công\t150000\tngười\t2025-01-01\t1\n" +
                "6\t2\tTheo chuyến\t500000\tchuyến\t2025-01-01\t1\n" +
                "7\t3\t1 xe/chuyến\t200000\tchuyến\t2025-01-01\t1\n" +
                "8\t3\t1 xe/Theo ngày\t1000000\tngày\t2025-01-01\t1\n" +
                "9\t4\tTheo kg\t10000\tkg\t2025-01-01\t1\n" +
                "10\t4\tNhân công\t120000\tngười\t2025-01-01\t1\n" +
                "11\t5\tTheo m2\t30000\tm2\t2025-01-01\t1\n" +
                "12\t5\tTheo bộ\t50000\tbộ\t2025-01-01\t1\n" +
                "13\t6\tTheo tháng\t500000\ttháng\t2025-01-01\t1\n" +
                "14\t6\tTheo kg\t15000\tkg\t2025-01-01\t1\n\n" +
                "Nếu có hình ảnh được gửi kèm, hãy phân tích hình ảnh và đưa ra lời khuyên phù hợp về dịch vụ chuyển nhà. " +
                "Bạn có thể đánh giá đồ đạc, không gian, hoặc tình trạng để tư vấn dịch vụ phù hợp.";

        try {
            String response;
            
            // Nếu có ảnh thì sử dụng Gemini Vision API
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                response = processWithImagesGemini(systemPrompt, request.getMessage(), request.getImages());
            } else {
                // Chỉ có text, sử dụng chat client thông thường
                response = chatClient.prompt(systemPrompt)
                        .user(request.getMessage())
                        .call()
                        .content();
            }
            
            return ChatAiResponse.builder()
                    .answer(response)
                    .build();
                    
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xử lý yêu cầu: " + e.getMessage(), e);
        }
    }
    
    private String processWithImagesGemini(String systemPrompt, String userMessage, List<String> images) {
        try {
            // Tạo request cho Gemini Vision API
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
            
            // Tạo content array
            java.util.List<Map<String, Object>> contents = new java.util.ArrayList<>();
            
            // Thêm text content
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", systemPrompt + "\n\n" + (userMessage != null ? userMessage : "Hãy phân tích hình ảnh này"));
            
            java.util.List<Map<String, Object>> parts = new java.util.ArrayList<>();
            parts.add(textPart);
            

            for (String imageBase64 : images) {
                Map<String, Object> imagePart = new HashMap<>();
                Map<String, Object> inlineData = new HashMap<>();
                inlineData.put("mime_type", "image/jpeg"); // Có thể cần detect mime type từ base64
                inlineData.put("data", imageBase64.split(",")[1]); // Remove data:image/jpeg;base64, prefix
                imagePart.put("inline_data", inlineData);
                parts.add(imagePart);
            }
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", parts);
            contents.add(content);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);
            
            // Cấu hình generation config
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topK", 40);
            generationConfig.put("topP", 0.95);
            generationConfig.put("maxOutputTokens", 1024);
            requestBody.put("generationConfig", generationConfig);
            
            // Gửi request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                java.util.List<Map<String, Object>> candidates = (java.util.List<Map<String, Object>>) responseBody.get("candidates");
                
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content2 = (Map<String, Object>) candidate.get("content");
                    @SuppressWarnings("unchecked")
                    java.util.List<Map<String, Object>> parts2 = (java.util.List<Map<String, Object>>) content2.get("parts");
                    
                    if (parts2 != null && !parts2.isEmpty()) {
                        return (String) parts2.get(0).get("text");
                    }
                }
            }
            
            throw new RuntimeException("Không thể xử lý hình ảnh");
            
        } catch (Exception e) {
            // Fallback: nếu có lỗi với Gemini Vision, chỉ xử lý text
            return chatClient.prompt(systemPrompt + "\n\nLưu ý: Có " + images.size() + " hình ảnh được gửi kèm nhưng không thể phân tích được.")
                    .user(userMessage != null ? userMessage : "Có hình ảnh được gửi kèm")
                    .call()
                    .content();
        }
    }
}
