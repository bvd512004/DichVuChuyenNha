package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.InvoiceResponse;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Invoices;
import com.swp391.dichvuchuyennha.entity.Payment;
import com.swp391.dichvuchuyennha.mapper.InvoiceMapper;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.InvoiceRepository;
import com.swp391.dichvuchuyennha.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceMapper invoiceMapper;

    /**
     * ✅ Tạo hóa đơn mới (kèm VAT và mapping dịch vụ)
     */
    @Transactional
    public InvoiceResponse createInvoice(Integer contractId, Integer paymentId, String vatNumber) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng có id = " + contractId));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán có id = " + paymentId));

        // 🔹 Khởi tạo hóa đơn mới
        Invoices invoice = new Invoices();
        invoice.setContract(contract);
        invoice.setPayment(payment);
        invoice.setInvoiceDate(LocalDateTime.now());

        // 🔹 Tính tổng cộng với VAT 10%
        double totalAmount = payment.getAmount();
        double totalWithVat = totalAmount * 1.1;
        invoice.setTotalAmount(totalWithVat);
        invoice.setType(payment.getPaymentType());

        // 🔹 Xử lý VAT Number
        String vat = vatNumber;
        if (vat == null || vat.isEmpty()) {
            if (contract.getQuotation() != null &&
                    contract.getQuotation().getSurvey() != null &&
                    contract.getQuotation().getSurvey().getRequest() != null &&
                    contract.getQuotation().getSurvey().getRequest().getUser() != null &&
                    contract.getQuotation().getSurvey().getRequest().getUser().getCustomerCompany() != null) {
                vat = contract.getQuotation().getSurvey().getRequest()
                        .getUser().getCustomerCompany().getTaxCode();
            }
        }
        if (vat == null || vat.isEmpty()) {
            vat = "N/A";
        }
        invoice.setVatNumber(vat);

        // 🔹 Lưu hóa đơn
        Invoices savedInvoice = invoiceRepository.save(invoice);

        // 🔹 Ép tải dữ liệu dịch vụ (nếu JPA lazy)
        if (savedInvoice.getContract() != null &&
                savedInvoice.getContract().getQuotation() != null &&
                savedInvoice.getContract().getQuotation().getQuotationServices() != null) {
            savedInvoice.getContract().getQuotation().getQuotationServices().size();
        }

        // 🔹 Map sang DTO trả về
        return invoiceMapper.toResponse(savedInvoice);
    }

    /**
     * ✅ Lấy danh sách hóa đơn của user hiện tại
     */
    @Transactional
    public List<InvoiceResponse> getInvoicesOfCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Chưa đăng nhập");
        }

        String username = auth.getName();
        List<Invoices> invoices = invoiceRepository
                .findByContractQuotationSurveyRequestUserUsername(username);

        // Load lazy
        invoices.forEach(inv -> {
            if (inv.getContract() != null &&
                    inv.getContract().getQuotation() != null &&
                    inv.getContract().getQuotation().getQuotationServices() != null) {
                inv.getContract().getQuotation().getQuotationServices().size();
            }
        });

        return invoices.stream()
                .map(this::mapToResponseWithDeposit)
                .collect(Collectors.toList());
    }

    private InvoiceResponse mapToResponseWithDeposit(Invoices invoice) {
        InvoiceResponse dto = invoiceMapper.toResponse(invoice);

        // 1. totalAmount = amount * 1.1
        double amount = invoice.getPayment().getAmount();
        double totalWithVat = amount ;
        dto.setTotalAmount(totalWithVat);

        // 2. Tính tổng DEPOSIT (cùng contract)
        Integer contractId = invoice.getContract().getContractId();
        List<Payment> deposits = paymentRepository.findDepositsByContractId(contractId);

        double depositSum = deposits.stream()
                .mapToDouble(p -> p.getAmount() )  // mỗi DEPOSIT cũng +10% VAT
                .sum();

        dto.setDepositAmount(depositSum);

        return dto;
    }
}