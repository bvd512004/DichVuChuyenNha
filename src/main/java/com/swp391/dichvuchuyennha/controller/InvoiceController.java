package com.swp391.dichvuchuyennha.controller;

import com.swp391.dichvuchuyennha.dto.request.CreateInvoiceRequest;
import com.swp391.dichvuchuyennha.dto.response.ListPaymentResponse;
import com.swp391.dichvuchuyennha.entity.Invoices;
import com.swp391.dichvuchuyennha.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/create")
    public ResponseEntity<Invoices> createInvoice(@RequestBody CreateInvoiceRequest request) {
        Invoices invoice = invoiceService.createInvoice(
                request.getContractId(),
                request.getPaymentId(),
                request.getVatNumber()
        );
        return ResponseEntity.ok(invoice);
    }

}

