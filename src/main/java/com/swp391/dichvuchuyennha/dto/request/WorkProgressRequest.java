package com.swp391.dichvuchuyennha.dto.request;

import lombok.Data;

@Data
public class WorkProgressRequest {
    private Integer contractId;
    private String taskDescription;
    private String progressStatus; // pending | in_progress | completed
}
//h