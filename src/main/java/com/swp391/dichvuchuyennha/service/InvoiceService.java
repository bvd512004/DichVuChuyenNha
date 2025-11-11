package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.ListPaymentResponse;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Invoices;
import com.swp391.dichvuchuyennha.entity.Payment;
import com.swp391.dichvuchuyennha.mapper.ListPaymentMapper;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.InvoiceRepository;
import com.swp391.dichvuchuyennha.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ListPaymentMapper listPaymentMapper;

    /**
     * Tạo hóa đơn mới và trả về thông tin Payment dạng ListPaymentResponse
     */
    public Invoices createInvoice(Integer contractId, Integer paymentId, String vatNumber) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng có id = " + contractId));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán có id = " + paymentId));

        Invoices invoice = new Invoices();
        invoice.setContract(contract);
        invoice.setPayment(payment);
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setTotalAmount(payment.getAmount());
        invoice.setType(payment.getPaymentType());
        invoice.setVatNumber(vatNumber);

        // Lưu và trả về hóa đơn vừa tạo
        return invoiceRepository.save(invoice);
    }
}
