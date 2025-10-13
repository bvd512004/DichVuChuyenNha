package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.dto.response.WorkProgressResponse;
import com.swp391.dichvuchuyennha.entity.WorkProgress;
import com.swp391.dichvuchuyennha.exception.AppException;
import com.swp391.dichvuchuyennha.exception.ErrorCode;
import com.swp391.dichvuchuyennha.mapper.WorkProgressMapper;
import com.swp391.dichvuchuyennha.repository.WorkProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkProgressCustomerServiceImpl implements WorkProgressCustomerService {

    private final WorkProgressRepository workProgressRepository;
    private final WorkProgressMapper mapper;

    @Override
    public List<WorkProgressResponse> getWorkProgressForCustomer(Integer userId) {
        List<WorkProgress> progressList = workProgressRepository.findByCustomerUserId(userId);
        return progressList.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }//k

    @Override
    public List<WorkProgressResponse> getWorkProgressByContract(Integer userId, Integer contractId) {
        List<WorkProgress> progressList = workProgressRepository.findByContractAndCustomer(contractId, userId);
        if (progressList.isEmpty()) {
            throw new AppException(ErrorCode.WORK_PROGRESS_NOT_FOUND);
        }
        return progressList.stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}
