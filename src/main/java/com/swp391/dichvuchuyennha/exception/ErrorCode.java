package com.swp391.dichvuchuyennha.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid key", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least 3 characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least 6 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Email/Username hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least 18", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1009, "Role not existed", HttpStatus.NOT_FOUND),
    USERNAME_EXISTED(1010, "Username is existed", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1011, "Email is existed!", HttpStatus.BAD_REQUEST),
    PHONE_EXISTED(1012, "Phone is existed!", HttpStatus.BAD_REQUEST),
    CONTRACT_NOT_FOUND(1013, "Contract not found", HttpStatus.NOT_FOUND),
    WORK_PROGRESS_NOT_FOUND(1014, "Work progress not found", HttpStatus.NOT_FOUND),
    INVALID_REQUEST(1015, "Invalid request", HttpStatus.BAD_REQUEST),
    QUOTATION_NOT_FOUND(1016, "Quotation does not exist", HttpStatus.NOT_FOUND),
    SURVEY_NOT_FOUND(1017, "Survey does not exist", HttpStatus.NOT_FOUND),
    INVALID_STATUS(1018, "Invalid status", HttpStatus.BAD_REQUEST),
    QUOTATION_SERVICE_NOT_FOUND(1019, "Quotation service does not exist", HttpStatus.NOT_FOUND),
    EMPLOYEE_NOT_FREE(1020, "Employee not free", HttpStatus.BAD_REQUEST),
    INVALID_CONTRACT_STATUS(1021, "Contract status invalid", HttpStatus.BAD_REQUEST),
    NO_EMPLOYEES_ASSIGNED(1022, "No employees assigned to contract", HttpStatus.BAD_REQUEST),
    EMPLOYEE_NOT_ASSIGNED_TO_CONTRACT(1023, "Employee not assigned to this contract", HttpStatus.BAD_REQUEST),
    INVALID_EMPLOYEE_STATUS(1024, "Invalid employee status", HttpStatus.BAD_REQUEST),
    WORK_PROGRESS_ALREADY_EXISTS(1025, "Work progress already exists", HttpStatus.BAD_REQUEST),
    MISSING_PARAMETER(1026, "Missing required parameter", HttpStatus.BAD_REQUEST),
    PRICING_NOT_FOUND(1027, "Pricing not found", HttpStatus.NOT_FOUND),
    DATA_NOT_FOUND(1028, "Data not found", HttpStatus.NOT_FOUND),
    INVALID_PARAMETER(1029, "Invalid parameter", HttpStatus.BAD_REQUEST),
    INVALID_STATUS_TRANSITION(1030, "Invalid status transition", HttpStatus.BAD_REQUEST),


    INVALID_INVOICE_TYPE(1031, "Loại hóa đơn không hợp lệ. Chỉ chấp nhận 'deposit' hoặc 'final'", HttpStatus.BAD_REQUEST),
    CONTRACT_NOT_IN_DEPOSIT_PENDING(1032, "Hợp đồng chưa ở trạng thái chờ đặt cọc (DEPOSIT_PENDING)", HttpStatus.BAD_REQUEST),
    CONTRACT_NOT_IN_FINAL_COMPLETED(1033, "Hợp đồng chưa hoàn thành để xuất hóa đơn cuối (FINAL_COMPLETED)", HttpStatus.BAD_REQUEST),
    NO_PENDING_DEPOSIT_PAYMENT(1034, "Không có khoản đặt cọc nào đang chờ thanh toán", HttpStatus.BAD_REQUEST),
    NO_PENDING_FINAL_PAYMENT(1035, "Không có khoản thanh toán cuối nào đang chờ thanh toán", HttpStatus.BAD_REQUEST),
    DEPOSIT_INVOICE_ALREADY_EXISTS(1036, "Hóa đơn đặt cọc đã được tạo trước đó cho hợp đồng này", HttpStatus.BAD_REQUEST),
    FINAL_INVOICE_ALREADY_EXISTS(1037, "Hóa đơn thanh toán cuối đã được tạo trước đó cho hợp đồng này", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(1041,"Payment not found",HttpStatus.NOT_FOUND),
    // ===== OTHER ERRORS =====
    VEHICLE_NOT_FOUND(1038, "Vehicle not found", HttpStatus.NOT_FOUND),
    ROLE_NOT_ASSIGNED(1039, "Role not assigned to user", HttpStatus.BAD_REQUEST),
    FORBIDDEN(1040, "Forbidden - Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN);
    VEHICLE_NOT_FOUND(1031,"Vehicle not found" , HttpStatus.NOT_FOUND),
    ROLE_NOT_ASSIGNED(1032,"Role not assigned" , HttpStatus.NOT_FOUND );

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}