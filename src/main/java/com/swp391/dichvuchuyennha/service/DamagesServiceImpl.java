package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.DamageFeedbackRequest;
import com.swp391.dichvuchuyennha.dto.request.DamageRequest;
import com.swp391.dichvuchuyennha.dto.response.DamageResponse;
import com.swp391.dichvuchuyennha.entity.Contract;
import com.swp391.dichvuchuyennha.entity.Damages;
import com.swp391.dichvuchuyennha.entity.Employee;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.repository.ContractRepository;
import com.swp391.dichvuchuyennha.repository.DamagesRepository;
import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
import com.swp391.dichvuchuyennha.service.DamagesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DamagesServiceImpl implements DamagesService {

    private final DamagesRepository damagesRepository;
    private final ContractRepository contractRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public DamageResponse createDamage(Integer employeeId, DamageRequest request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        Damages damage = new Damages();
        damage.setResponsibleEmployee(employee);
        damage.setContract(contract);
        damage.setCause(request.getCause());
        damage.setCost(request.getCost());
        damage.setImageUrl(request.getImageUrl());
        damage.setStatus("pending_customer");

        return toResponse(damagesRepository.save(damage));
    }

    @Override
    public DamageResponse updateStatus(Integer damageId, DamageFeedbackRequest feedback) {
        Damages damage = damagesRepository.findById(damageId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        if ("approve".equalsIgnoreCase(feedback.getAction())) {
            // ✅ Khách đồng ý → chờ quản lý duyệt
            damage.setCustomerFeedback("Approved by Customer");
            damage.setStatus("pending_manager");

        } else if ("reject".equalsIgnoreCase(feedback.getAction())) {
            // ❌ Khách từ chối → chờ nhân viên sửa
            damage.setStatus("rejected");
            damage.setCustomerFeedback(feedback.getCustomerFeedback());
        }

        return toResponse(damagesRepository.save(damage));
    }



    // cap nhat
    @Override
    public DamageResponse updateDamage(Integer damageId, DamageRequest request) {
        Damages damage = damagesRepository.findById(damageId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        damage.setCause(request.getCause());
        damage.setCost(request.getCost());
        damage.setImageUrl(request.getImageUrl());

        // 🔁 Reset lại quy trình sau khi chỉnh sửa
        damage.setStatus("pending_customer"); // gửi lại cho khách duyệt
        damage.setCustomerFeedback(null);
        damage.setManagerFeedback(null);

        return toResponse(damagesRepository.save(damage));
    }

    // xu li manager status
@Override
public DamageResponse updateManagerStatus(Integer damageId, DamageFeedbackRequest feedback) {
    Damages damage = damagesRepository.findById(damageId)
            .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

    if ("approve".equalsIgnoreCase(feedback.getAction())) {
        damage.setManagerFeedback("Approved by Manager");
        damage.setStatus("approved");

    } else if ("reject".equalsIgnoreCase(feedback.getAction())) {
        damage.setManagerFeedback(feedback.getManagerFeedback());
        damage.setStatus("rejected");
    }

    return toResponse(damagesRepository.save(damage));
}



    @Override
    public List<DamageResponse> getByContractId(Integer contractId) {
        return damagesRepository.findByContract_ContractId(contractId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private DamageResponse toResponse(Damages d) {
        return DamageResponse.builder()
                .damageId(d.getDamageId())
                .contractId(d.getContract().getContractId())
                .cause(d.getCause())
                .cost(d.getCost())
                .status(d.getStatus())
                .imageUrl(d.getImageUrl())
                .employeeName(d.getResponsibleEmployee() != null ?
                        d.getResponsibleEmployee().getUser().getUsername() : null)
                .customerFeedback(d.getCustomerFeedback())
                .managerFeedback(d.getManagerFeedback())
                .build();
    }
}
//fix end
