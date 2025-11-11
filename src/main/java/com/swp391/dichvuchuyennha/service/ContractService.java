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
    private final PaymentService paymentService;

    /** ✅ Tạo hợp đồng mới */
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

        // ✅ Sau khi ký hợp đồng → tạo QR thanh toán đặt cọc
//        paymentService.createDepositPayment(contractId);

        return contractMapper.toResponse(saved);
    }


    /** ✅ Lấy hợp đồng đã ký của user hiện tại */
    @Transactional(readOnly = true)
    public List<ContractResponse> getSignedContractsOfCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }

        String username = auth.getName();
        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Contract> contracts = contractRepository.findByQuotation_Survey_Request_User_UserIdAndStatus(
                user.getUserId(), "SIGNED"
        );

        return contracts.stream()
                .map(contractMapper::toResponse)
                .toList();
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

    /** ✅ Lấy toàn bộ hợp đồng đã ký (cho manager) */
    @Transactional(readOnly = true)
    public List<ContractResponse> getAllContracts() {
        try {
            // Lấy hợp đồng đã ký (SIGNED, DEPOSIT_PAID, hoặc các status khác sau khi ký)
            List<Contract> contracts = contractRepository.findAll()
                    .stream()
                    .filter(c -> c.getSignedDate() != null) // Chỉ lấy hợp đồng đã ký
                    .toList();
            
            return contracts.stream()
                    .filter(contract -> {
                        // Kiểm tra contract có dữ liệu hợp lệ không
                        try {
                            return contract != null && 
                                   contract.getQuotation() != null &&
                                   contract.getQuotation().getSurvey() != null &&
                                   contract.getQuotation().getSurvey().getRequest() != null;
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .map(contract -> {
                        try {
                            // Force load các lazy collections trong transaction
                            if (contract.getQuotation() != null) {
                                Quotations quotation = contract.getQuotation();
                                
                                // Force load survey
                                if (quotation.getSurvey() != null) {
                                    Surveys survey = quotation.getSurvey();
                                    
                                    // Force load request
                                    if (survey.getRequest() != null) {
                                        Requests request = survey.getRequest();
                                        
                                        // Force load user
                                        if (request.getUser() != null) {
                                            Users user = request.getUser();
                                            user.getUserId(); // Force load
                                            
                                            // Force load customer company
                                            if (user.getCustomerCompany() != null) {
                                                user.getCustomerCompany().getCompanyName(); // Force load
                                            }
                                        }
                                    }
                                }
                                
                                // Force load quotation services
                                if (quotation.getQuotationServices() != null) {
                                    quotation.getQuotationServices().forEach(qs -> {
                                        if (qs != null) {
                                            if (qs.getService() != null) {
                                                qs.getService().getServiceName(); // Force load
                                            }
                                            if (qs.getPrice() != null) {
                                                qs.getPrice().getPriceType(); // Force load
                                            }
                                        }
                                    });
                                }
                            }
                            
                            // Force load signedBy
                            if (contract.getSignedBy() != null) {
                                contract.getSignedBy().getUserId(); // Force load
                                contract.getSignedBy().getUsername(); // Force load
                            }
                            
                            // Sử dụng buildContractDetail để đảm bảo xử lý đúng
                            return buildContractDetail(contract);
                        } catch (Exception e) {
                            e.printStackTrace();
                            // Trả về response đơn giản nếu có lỗi
                            return ContractResponse.builder()
                                    .contractId(contract.getContractId())
                                    .startDate(contract.getStartDate())
                                    .endDate(contract.getEndDate())
                                    .depositAmount(contract.getDepositAmount())
                                    .totalAmount(contract.getTotalAmount())
                                    .status(contract.getStatus())
                                    .signedDate(contract.getSignedDate())
                                    .build();
                        }
                    })
                    .filter(response -> response != null)
                    .toList();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi lấy danh sách hợp đồng: " + e.getMessage(), e);
        }
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

                    var request = quotation.getSurvey().getRequest();
                    if (request != null) {
                        if (request.getMovingDay() != null) {
                            movingDay = request.getMovingDay()
                                    .toInstant()
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();
                        }

                        var user = request.getUser();
                        if (user != null) {
                            username = user.getUsername();
                            if (user.getCustomerCompany() != null) {
                                companyName = user.getCustomerCompany().getCompanyName();
                            }
                        }
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

    /** ✅ Lấy hợp đồng đã ký có nhân viên được gán */ // fix status
    public List<ContractDTO> getContractsSignedWithEmployees() {
        return contractRepository.findByStatus("DEPOSIT_PAID").stream()
                .filter(c -> c.getAssignmentEmployees() != null && !c.getAssignmentEmployees().isEmpty())
                .map(c -> new ContractDTO(c.getContractId(), c.getStatus()))
                .toList();
    }

    /** ✅ Lấy danh sách hợp đồng đủ điều kiện tạo WorkProgress */ //mới fix status
    @Transactional(readOnly = true)
    public List<ContractResponse> getEligibleContractsForWorkProgress() {
        List<Contract> contracts = contractRepository.findByStatus("DEPOSIT_PAID");

        return contracts.stream()
                .filter(c -> c.getAssignmentEmployees() != null && !c.getAssignmentEmployees().isEmpty())
                .map(c -> {
                    var quotation = c.getQuotation();
                    String startLocation = null;
                    String endLocation = null;

                    if (quotation != null && quotation.getSurvey() != null && quotation.getSurvey().getRequest() != null) {
                        startLocation = quotation.getSurvey().getRequest().getPickupAddress();
                        endLocation = quotation.getSurvey().getRequest().getDestinationAddress();
                    }

                    return ContractResponse.builder()
                            .contractId(c.getContractId())
                            .startDate(c.getStartDate())
                            .endDate(c.getEndDate())
                            .totalAmount(c.getTotalAmount())
                            .depositAmount(c.getDepositAmount())
                            .status(c.getStatus())
                            .startLocation(startLocation)
                            .endLocation(endLocation)
                            .build();
                })
                .toList();
    }
}
//fix sạch