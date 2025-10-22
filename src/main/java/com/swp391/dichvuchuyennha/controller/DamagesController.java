//package com.swp391.dichvuchuyennha.controller;
//
//import java.util.List;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.PutMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.swp391.dichvuchuyennha.dto.request.DamageRequest;
//import com.swp391.dichvuchuyennha.dto.response.DamageResponse;
//import com.swp391.dichvuchuyennha.service.DamagesService;
//
//import lombok.RequiredArgsConstructor;
//
//@RestController
//@RequestMapping("/api/damages")
//@RequiredArgsConstructor
//public class DamagesController {
//
//    private final DamagesService damagesService;
//
//    @PostMapping
//    public ResponseEntity<DamageResponse> createDamage(@RequestBody DamageRequest request) {
//        return ResponseEntity.ok(damagesService.createDamage(request));
//    }
//
//    @PutMapping("/{damageId}")
//    public ResponseEntity<DamageResponse> updateDamage(
//            @PathVariable Integer damageId,
//            @RequestBody DamageRequest request) {
//        return ResponseEntity.ok(damagesService.updateDamage(damageId, request));
//    }
//
//    @GetMapping
//    public ResponseEntity<List<DamageResponse>> getAllDamages() {
//        return ResponseEntity.ok(damagesService.getAllDamages());
//    }
//
//    @GetMapping("/{damageId}")
//    public ResponseEntity<DamageResponse> getDamageById(@PathVariable Integer damageId) {
//        return ResponseEntity.ok(damagesService.getDamageById(damageId));
//    }
//
//    @DeleteMapping("/{damageId}")
//    public ResponseEntity<Void> deleteDamage(@PathVariable Integer damageId) {
//        damagesService.deleteDamage(damageId);
//        return ResponseEntity.noContent().build();
//    }
//}
