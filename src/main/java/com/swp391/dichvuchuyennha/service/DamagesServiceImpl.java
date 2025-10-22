//package com.swp391.dichvuchuyennha.service;
//
//import com.swp391.dichvuchuyennha.dto.request.DamageRequest;
//import com.swp391.dichvuchuyennha.dto.response.DamageResponse;
//import com.swp391.dichvuchuyennha.entity.Contract;
//import com.swp391.dichvuchuyennha.entity.Damages;
//import com.swp391.dichvuchuyennha.entity.Employee;
//import com.swp391.dichvuchuyennha.exception.AppException;
//import com.swp391.dichvuchuyennha.exception.ErrorCode;
//import com.swp391.dichvuchuyennha.mapper.DamageMapper;
//import com.swp391.dichvuchuyennha.repository.ContractRepository;
//import com.swp391.dichvuchuyennha.repository.DamagesRepository;
//import com.swp391.dichvuchuyennha.repository.EmployeeRepository;
//import com.swp391.dichvuchuyennha.service.DamagesService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//import jakarta.persistence.EntityNotFoundException;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//public class DamagesServiceImpl implements DamagesService {
//
//    private final DamagesRepository damagesRepository;
//    private final ContractRepository contractRepository;
//    private final EmployeeRepository employeeRepository;
//    private final DamageMapper damageMapper;
//
//    @Override
//    public DamageResponse createDamage(DamageRequest request) {
//        Contract contract = contractRepository.findById(request.getContractId())
//                .orElseThrow(() -> new EntityNotFoundException("Contract not found"));
//
//        Employee employee = employeeRepository.findById(request.getResponsibleEmployeeId())
//                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
//
//        Damages damage = new Damages();
//        damage.setContract(contract);
//        damage.setCause(request.getCause());
//        damage.setResponsibleEmployee(employee);
//        damage.setCost(request.getCost());
//        damage.setStatus(request.getStatus());
//
//        return damageMapper.toResponse(damagesRepository.save(damage));
//    }
//
//    @Override
//    public DamageResponse updateDamage(Integer damageId, DamageRequest request) {
//        Damages damage = damagesRepository.findById(damageId)
//                .orElseThrow(() -> new EntityNotFoundException("Damage not found"));
//
//        if (request.getContractId() != null) {
//            Contract contract = contractRepository.findById(request.getContractId())
//                    .orElseThrow(() -> new EntityNotFoundException("Contract not found"));
//            damage.setContract(contract);
//        }
//
//        if (request.getResponsibleEmployeeId() != null) {
//            Employee employee = employeeRepository.findById(request.getResponsibleEmployeeId())
//                    .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
//            damage.setResponsibleEmployee(employee);
//        }
//
//        damage.setCause(request.getCause());
//        damage.setCost(request.getCost());
//        damage.setStatus(request.getStatus());
//
//        return damageMapper.toResponse(damagesRepository.save(damage));
//    }
//
//    @Override
//    public List<DamageResponse> getAllDamages() {
//        return damagesRepository.findAll()
//                .stream()
//                .map(damageMapper::toResponse)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public DamageResponse getDamageById(Integer damageId) {
//        Damages damage = damagesRepository.findById(damageId)
//                .orElseThrow(() -> new EntityNotFoundException("Damage not found"));
//        return damageMapper.toResponse(damage);
//    }
//
//    @Override
//    public void deleteDamage(Integer damageId) {
//        if (!damagesRepository.existsById(damageId)) {
//            throw new AppException(ErrorCode.INVALID_KEY);
//        }
//        damagesRepository.deleteById(damageId);
//    }
//}
