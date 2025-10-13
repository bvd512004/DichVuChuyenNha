//package com.swp391.dichvuchuyennha.controller;
//
//import com.swp391.dichvuchuyennha.dto.response.ContractResponse;
//import com.swp391.dichvuchuyennha.dto.response.FeedbackResponse;
//import com.swp391.dichvuchuyennha.dto.response.PaymentResponse;
//import com.swp391.dichvuchuyennha.dto.response.RequestResponse;
//import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;
//import com.swp391.dichvuchuyennha.service.HistoryService; // New service
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/users")
//public class HistoryController {
//
//    private final HistoryService historyService;
//
//    public HistoryController(HistoryService historyService) {
//        this.historyService = historyService;
//    }
//
//    @GetMapping("/{userId}/history")
//    public Map<String, Object> getUserHistory(@PathVariable Integer userId) {
//        return historyService.getUserHistory(userId);
//    }
//}