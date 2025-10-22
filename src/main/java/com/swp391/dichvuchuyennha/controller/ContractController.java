package com.swp391.dichvuchuyennha.controller;

import java.util.List;


import com.swp391.dichvuchuyennha.entity.Contract;

import com.swp391.dichvuchuyennha.dto.request.ContractRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.swp391.dichvuchuyennha.dto.response.ContractDTO;
import com.swp391.dichvuchuyennha.dto.response.ContractResponse;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.UserRepository;
import com.swp391.dichvuchuyennha.service.AuthenticationService;
import com.swp391.dichvuchuyennha.service.ContractService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ContractController {

    private final ContractRepository contractRepository;
    private final ContractService contractService;
    private final AuthenticationService authService;
    private final UserRepository userRepository;

    /** Lấy danh sách hợp đồng chưa ký của user đang login */
    @GetMapping("/unsigned/me")
    public ResponseEntity<List<ContractResponse>> getUnsignedContracts() {
        // Lấy username từ context
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Lấy user từ DB
        Users user = userRepository.findByUsername(username).orElseThrow();

        // Lấy danh sách hợp đồng unsigned theo userId
        List<ContractResponse> contracts = contractService.getUnsignedContracts(user.getUserId());

        return ResponseEntity.ok(contracts);
    }

    /** Ký hợp đồng */
    @PutMapping("/sign/{contractId}")
    public ResponseEntity<ContractResponse> signContract(@PathVariable Integer contractId) {
        // Lấy username từ context
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Lấy user từ DB
        Users user = userRepository.findByUsername(username).orElseThrow();

        // Gọi service ký hợp đồng
        ContractResponse signed = contractService.signContract(contractId, user.getUserId());

        return ResponseEntity.ok(signed);
    }

    // GET tất cả hợp đồng (dùng DTO)
//    @GetMapping
//    public List<ContractDTO> getUnsignedContractsForManager() {
//        return contractRepository.findByStatus("SIGNED").stream()
//                .map(c -> new ContractDTO(c.getContractId(), c.getStatus()))
//                .toList();
//    }
    @GetMapping
    public List<ContractDTO> getSignedContractsForManager() {
        return contractRepository.findByStatus("SIGNED").stream()
                .map(c -> new ContractDTO(c.getContractId(), c.getStatus()))
                .toList();
    }
    @PostMapping
    public ResponseEntity<ContractResponse> create(@RequestBody ContractRequest request) {
        return ResponseEntity.ok(contractService.createContract(request));
    }
    @PutMapping("/{id}/sign")
    public ResponseEntity<ContractResponse> sign(
            @PathVariable Integer id,
            @RequestParam Integer userId) {
        return ResponseEntity.ok(contractService.signContract(id, userId));
    }
    @PutMapping("/{id}")
    public ResponseEntity<ContractResponse> update(
            @PathVariable Integer id,
            @RequestBody ContractRequest request) {
        return ResponseEntity.ok(contractService.updateContract(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        contractService.deleteContract(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/manager")
    public ResponseEntity<List<ContractResponse>> getAll() {
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @GetMapping("/my-signed")
    public List<ContractResponse> getMySignedContracts() {
        return contractService.getSignedContractsOfCurrentUser();
    }


    /** ✅ Lấy chi tiết hợp đồng theo ID (để hiển thị thông tin + nhân viên đã gán) */
    @GetMapping("/{contractId}")
    public ResponseEntity<ContractResponse> getContractDetail(@PathVariable Integer contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        ContractResponse response = contractService.buildContractDetail(contract);
        return ResponseEntity.ok(response);
    }//moi them
    @GetMapping("/eligible")
    public ResponseEntity<List<ContractResponse>> getEligibleContracts() {
        List<ContractResponse> eligibleContracts = contractService.getEligibleContractsForWorkProgress();
        return ResponseEntity.ok(eligibleContracts);
    }

}






//fix đủ

