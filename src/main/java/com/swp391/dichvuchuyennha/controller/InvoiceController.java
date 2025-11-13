package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.ApiResponse;
import com.swp391.dichvuchuyennha.dto.request.CreateInvoiceRequest;
import com.swp391.dichvuchuyennha.dto.response.InvoiceResponse;
import com.swp391.dichvuchuyennha.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    // Tạo hóa đơn mới
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@RequestBody CreateInvoiceRequest request) {
        InvoiceResponse invoiceResponse = invoiceService.createInvoice(
                request.getContractId(),
                request.getPaymentId(),
                request.getVatNumber()
        );

        ApiResponse<InvoiceResponse> response = ApiResponse.<InvoiceResponse>builder()
                .code(1000)
                .message("✅ Xuất hóa đơn thành công!")
                .result(invoiceResponse)
                .build();

        return ResponseEntity.ok(response);
    }


    // Lấy danh sách hóa đơn của user hiện tại
    @GetMapping("/me")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesOfCurrentUser() {
        List<InvoiceResponse> invoices = invoiceService.getInvoicesOfCurrentUser();
        return ResponseEntity.ok(invoices);
    }
}
