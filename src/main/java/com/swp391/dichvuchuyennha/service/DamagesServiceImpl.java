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
        damage.setStatus("pending_manager"); // ✅ Bắt đầu từ quản lý duyệt

        return toResponse(damagesRepository.save(damage));
    }

    // ✅ QUẢN LÝ DUYỆT TRƯỚC (Bước 1)
    @Override
    public DamageResponse updateManagerStatus(Integer damageId, DamageFeedbackRequest feedback) {
        Damages damage = damagesRepository.findById(damageId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        if ("approve".equalsIgnoreCase(feedback.getAction())) {
            // ✅ Quản lý đồng ý → chuyển cho khách hàng duyệt
            damage.setManagerFeedback("Quản lý đã duyệt");
            damage.setStatus("pending_customer");

        } else if ("reject".equalsIgnoreCase(feedback.getAction())) {
            // ❌ Quản lý từ chối → nhân viên phải sửa lại
            damage.setManagerFeedback(feedback.getManagerFeedback());
            damage.setStatus("rejected");
        }

        return toResponse(damagesRepository.save(damage));
    }

    // ✅ KHÁCH HÀNG DUYỆT SAU (Bước 2)
    @Override
    public DamageResponse updateStatus(Integer damageId, DamageFeedbackRequest feedback) {
        Damages damage = damagesRepository.findById(damageId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        if ("approve".equalsIgnoreCase(feedback.getAction())) {
            // ✅ Khách đồng ý → hoàn tất
            damage.setCustomerFeedback("Khách hàng đã đồng ý");
            damage.setStatus("approved");

        } else if ("reject".equalsIgnoreCase(feedback.getAction())) {
            // ❌ Khách từ chối → nhân viên phải sửa lại
            damage.setStatus("rejected");
            damage.setCustomerFeedback(feedback.getCustomerFeedback());
        }

        return toResponse(damagesRepository.save(damage));
    }

    // ✅ NHÂN VIÊN CẬP NHẬT LẠI (sau khi bị từ chối)
    @Override
    public DamageResponse updateDamage(Integer damageId, DamageRequest request) {
        Damages damage = damagesRepository.findById(damageId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        damage.setCause(request.getCause());
        damage.setCost(request.getCost());
        damage.setImageUrl(request.getImageUrl());

        // 🔁 Reset lại quy trình: quản lý duyệt lại từ đầu
        damage.setStatus("pending_manager");
        damage.setCustomerFeedback(null);
        damage.setManagerFeedback(null);

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