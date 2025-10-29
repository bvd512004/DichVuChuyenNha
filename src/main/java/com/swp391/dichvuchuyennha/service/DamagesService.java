package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.request.DamageFeedbackRequest;
import com.swp391.dichvuchuyennha.dto.request.DamageRequest;
import com.swp391.dichvuchuyennha.dto.response.DamageResponse;

import java.util.List;

public interface DamagesService {
    DamageResponse createDamage(Integer employeeId, DamageRequest request);
    DamageResponse updateStatus(Integer damageId, DamageFeedbackRequest feedback);
    DamageResponse updateDamage(Integer damageId, DamageRequest request);
    DamageResponse updateManagerStatus(Integer damageId, DamageFeedbackRequest feedback);
    List<DamageResponse> getByContractId(Integer contractId);
}
