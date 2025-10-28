package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.ContractRequest;
import com.swp391.dichvuchuyennha.dto.response.ContractDTO;
import com.swp391.dichvuchuyennha.dto.response.ContractResponse;
import com.swp391.dichvuchuyennha.dto.response.QuotationServiceInfo;
import com.swp391.dichvuchuyennha.entity.*;
import com.swp391.dichvuchuyennha.mapper.ContractMapper;
import com.swp391.dichvuchuyennha.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final ContractMapper contractMapper;
    private final QuotationRepository quotationRepository;

    /** ✅ Tạo hợp đồng mới */
    public ContractResponse createContract(ContractRequest request) {
        Quotations quotation = quotationRepository.findById(request.getQuotationId())
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        Contract contract = new Contract();
        contract.setQuotation(quotation);
        contract.setStartDate(request.getStartDate());
        contract.setDepositAmount(request.getDepositAmount());
        contract.setTotalAmount(quotation.getTotalPrice());
        contract.setStatus("UNSIGNED");

        Contract saved = contractRepository.save(contract);
        quotation.setStatus("CREATED");
        quotationRepository.save(quotation);

        return contractMapper.toResponse(saved);
    }

    /** ✅ Lấy danh sách hợp đồng chưa ký của 1 user */
    @Transactional(readOnly = true)
    public List<ContractResponse> getUnsignedContracts(Integer userId) {
        List<Contract> contracts =
                contractRepository.findByQuotation_Survey_Request_User_UserIdAndStatus(userId, "UNSIGNED");

        return contracts.stream()
                .map(contractMapper::toResponse)
                .toList();
    }

    /** ✅ Ký hợp đồng */
    @Transactional
    public ContractResponse signContract(Integer contractId, Integer userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        Users owner = contract.getQuotation().getSurvey().getRequest().getUser();
        if (!owner.getUserId().equals(userId)) {
            throw new RuntimeException("User not authorized to sign this contract");
        }

        if (!"UNSIGNED".equalsIgnoreCase(contract.getStatus())) {
            throw new RuntimeException("Contract already signed or invalid status");
        }

        contract.setStatus("SIGNED");
        contract.setSignedBy(user);
        contract.setSignedDate(LocalDateTime.now());

        Contract saved = contractRepository.save(contract);
        return contractMapper.toResponse(saved);
    }

    /** ✅ Cập nhật hợp đồng */
    public ContractResponse updateContract(Integer id, ContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStartDate(request.getStartDate());
        contract.setDepositAmount(request.getDepositAmount());
        contractRepository.save(contract);

        return contractMapper.toResponse(contract);
    }

    /** ✅ Xóa hợp đồng */
    public void deleteContract(Integer id) {
        if (!contractRepository.existsById(id)) throw new RuntimeException("Contract not found");
        contractRepository.deleteById(id);
    }

    /** ✅ Lấy toàn bộ hợp đồng */
    public List<ContractResponse> getAllContracts() {
        return contractRepository.findAll()
                .stream()
                .map(contractMapper::toResponse)
                .toList();
    }

    /** ✅ Xây chi tiết hợp đồng (bao gồm movingDay) */
    @Transactional(readOnly = true)
    public ContractResponse buildContractDetail(Contract contract) {
        try {
            if (contract == null) {
                throw new RuntimeException("Contract is null");
            }

            var quotation = contract.getQuotation();
            String username = null;
            String companyName = null;

            String startAddress = null;
            String endAddress = null;
            Double totalPrice = null;
            LocalDate movingDay = null;
            List<QuotationServiceInfo> serviceInfos = Collections.emptyList();

            if (quotation != null) {
                totalPrice = quotation.getTotalPrice();

                if (quotation.getSurvey() != null) {
                    startAddress = quotation.getSurvey().getAddressFrom();
                    endAddress = quotation.getSurvey().getAddressTo();
                }

                if (quotation.getRequest() != null && quotation.getRequest().getMovingDay() != null) {
                    movingDay = quotation.getRequest().getMovingDay()
                            .toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                }
                var user = quotation.getRequest().getUser();
                if (user != null) {
                    username = user.getUsername();
                    if (user.getCustomerCompany() != null) {
                        companyName = user.getCustomerCompany().getCompanyName();
                    }
                }

                if (quotation.getQuotationServices() != null) {
                    serviceInfos = quotation.getQuotationServices().stream()
                            .filter(qs -> qs != null && qs.getService() != null && qs.getPrice() != null)
                            .map(qs -> new QuotationServiceInfo(
                                    qs.getId(),
                                    qs.getService().getServiceName(),
                                    qs.getPrice().getPriceType(),
                                    qs.getQuantity(),
                                    qs.getSubtotal(),
                                    qs.getPrice().getAmount()
                            ))
                            .collect(Collectors.toList());
                }
            }

            return ContractResponse.builder()
                    .contractId(contract.getContractId())
                    .startDate(contract.getStartDate())
                    .endDate(contract.getEndDate())
                    .depositAmount(contract.getDepositAmount())
                    .totalAmount(contract.getTotalAmount())
                    .status(contract.getStatus())
                    .signedDate(contract.getSignedDate())
                    .signedById(contract.getSignedBy() != null ? contract.getSignedBy().getUserId() : null)
                    .signedByUsername(contract.getSignedBy() != null ? contract.getSignedBy().getUsername() : null)
                    .startLocation(startAddress)
                    .endLocation(endAddress)
                    .username(username)
                    .companyName(companyName)
                    .movingDay(movingDay)
                    .services(serviceInfos)
                    .totalPrice(totalPrice)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error building contract detail: " + e.getMessage());
        }
    }


    /** ✅ Lấy hợp đồng đã ký có nhân viên được gán */
    public List<ContractDTO> getContractsSignedWithEmployees() {
        return contractRepository.findByStatus("SIGNED").stream()
                .filter(c -> c.getAssignmentEmployees() != null && !c.getAssignmentEmployees().isEmpty())
                .map(c -> new ContractDTO(c.getContractId(), c.getStatus()))
                .toList();
    }

    /** ✅ Lấy danh sách hợp đồng đủ điều kiện tạo WorkProgress */
    @Transactional(readOnly = true)
    public List<ContractResponse> getEligibleContractsForWorkProgress() {
        List<Contract> contracts = contractRepository.findByStatus("SIGNED");

        return contracts.stream()
                .filter(c -> c.getAssignmentEmployees() != null && !c.getAssignmentEmployees().isEmpty())
                .map(c -> ContractResponse.builder()
                        .contractId(c.getContractId())
                        .startDate(c.getStartDate())
                        .endDate(c.getEndDate())
                        .totalAmount(c.getTotalAmount())
                        .depositAmount(c.getDepositAmount())
                        .status(c.getStatus())
                        .startLocation(c.getQuotation() != null && c.getQuotation().getSurvey() != null
                                ? c.getQuotation().getSurvey().getRequest().getPickupAddress()
                                : null)
                        .endLocation(c.getQuotation() != null && c.getQuotation().getSurvey() != null
                                ? c.getQuotation().getSurvey().getRequest().getDestinationAddress()
                                : null)
                        .build())
                .toList();
    }
}
//end