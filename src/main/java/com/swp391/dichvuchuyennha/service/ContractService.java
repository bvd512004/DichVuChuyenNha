package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.ContractRequest;
import com.swp391.dichvuchuyennha.dto.response.ContractDTO;
import com.swp391.dichvuchuyennha.dto.response.ContractResponse;
//import com.swp391.dichvuchuyennha.dto.response.EmployeeDTO;
import com.swp391.dichvuchuyennha.dto.response.QuotationServiceInfo;
import com.swp391.dichvuchuyennha.entity.*;
import com.swp391.dichvuchuyennha.mapper.ContractMapper;
import com.swp391.dichvuchuyennha.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    private final RequestAssignmentRepository requestAssignmentRepository;
    private final EmployeeRepository employeeRepository;


    // inject mapper
public ContractResponse createContract(ContractRequest request) {
    Quotations quotation = quotationRepository.findById(request.getQuotationId())
            .orElseThrow(() -> new RuntimeException("Quotation not found"));

    Contract contract = new Contract();
    contract.setQuotation(quotation);
    contract.setStartDate(request.getStartDate());
    contract.setEndDate(request.getEndDate());
    contract.setDepositAmount(request.getDepositAmount());
    contract.setTotalAmount(quotation.getTotalPrice());
    contract.setStatus("UNSIGNED");

    Contract saved = contractRepository.save(contract);
    quotation.setStatus("CREATED");
    quotationRepository.save(quotation);
    List<RequestAssignment> assignments = requestAssignmentRepository.findByRequest(quotation.getSurvey().getRequest());
    for (RequestAssignment assignment : assignments) {
        Employee emp = assignment.getEmployee();
        if (emp != null) {
            emp.setStatus("FREE");
            employeeRepository.save(emp);
        }
    }


    return contractMapper.toResponse(saved);
}



    @Transactional(readOnly = true)
    public List<ContractResponse> getUnsignedContracts(Integer userId) {
        List<Contract> contracts =
                contractRepository.findByQuotation_Survey_Request_User_UserIdAndStatus(userId, "UNSIGNED");

        return contracts.stream()
                .map(contractMapper::toResponse)  // dùng mapper
                .toList();
    }

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
        return contractMapper.toResponse(saved); // mapper xử lý

    }
    @Transactional(readOnly = true)
    public List<ContractResponse> getSignedContractsOfCurrentUser() {
        // Lấy thông tin user hiện tại từ Spring Security
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }

        String username = auth.getName(); // giả sử username là unique
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lấy hợp đồng đã ký của user
        List<Contract> contracts = contractRepository.findByQuotation_Survey_Request_User_UserIdAndStatus(
                user.getUserId(), "SIGNED"
        );

        return contracts.stream()
                .map(contractMapper::toResponse)
                .toList();
    }

   




    public ContractResponse updateContract(Integer id, ContractRequest request) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setDepositAmount(request.getDepositAmount());
        contractRepository.save(contract);

        return contractMapper.toResponse(contract);
    }

    // Xóa hợp đồng
    public void deleteContract(Integer id) {
        if (!contractRepository.existsById(id)) throw new RuntimeException("Contract not found");
        contractRepository.deleteById(id);
    }

    // Lấy danh sách hợp đồng
    public List<ContractResponse> getAllContracts() {
        return contractRepository.findAll()
                .stream()
                .map(contractMapper::toResponse)
                .toList();
    }
    /** ✅ Xây ContractResponse chi tiết an toàn (kể cả thiếu dữ liệu) */
    @Transactional(readOnly = true)
    public ContractResponse buildContractDetail(Contract contract) {
        try {
            if (contract == null) {
                throw new RuntimeException("Contract is null");
            }

            // 🧱 Lấy dữ liệu quotation nếu có
            var quotation = contract.getQuotation();
            String startAddress = null;
            String endAddress = null;
            Double totalPrice = null;
            List<QuotationServiceInfo> serviceInfos = Collections.emptyList();

            if (quotation != null) {
                totalPrice = quotation.getTotalPrice();

                if (quotation.getSurvey() != null) {
                    startAddress = quotation.getSurvey().getRequest().getPickupAddress();
                    endAddress = quotation.getSurvey().getRequest().getDestinationAddress();
                }

                if (quotation.getQuotationServices() != null) {
                    serviceInfos = quotation.getQuotationServices().stream()
                            .filter(qs -> qs != null)
                            .filter(qs -> qs.getService() != null && qs.getPrice() != null)
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
                    .services(serviceInfos)
                    .totalPrice(totalPrice)
                    .build();
        } catch (Exception e) {
            // 🧠 log lỗi chi tiết để bạn dễ thấy
            e.printStackTrace();
            throw new RuntimeException("Error building contract detail: " + e.getMessage());
        }
    }
    public List<ContractDTO> getContractsSignedWithEmployees() {
        return contractRepository.findByStatus("SIGNED").stream()
                .filter(c -> c.getAssignmentEmployees() != null && !c.getAssignmentEmployees().isEmpty())
                .map(c -> new ContractDTO(c.getContractId(), c.getStatus()))
                .toList();
    }
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



}//fix đủ


