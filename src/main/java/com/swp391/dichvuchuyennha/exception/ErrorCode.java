package com.swp391.dichvuchuyennha.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1009, "Role not existed", HttpStatus.NOT_FOUND),

    USERNAME_EXISTED(1010,"Username is existed",HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1011,"Email is existed!",HttpStatus.BAD_REQUEST),
    PHONE_EXISTED(1012,"Phone is existed!",HttpStatus.BAD_REQUEST),
    CONTRACT_NOT_FOUND(1013,"Contract not found",HttpStatus.NOT_FOUND),
    WORK_PROGRESS_NOT_FOUND(1014,"Work progress not found",HttpStatus.NOT_FOUND),
    INVALID_REQUEST(1015, "Invalid request", HttpStatus.BAD_REQUEST),
    QUOTATION_NOT_FOUND(1016,"Quotation does not exist",HttpStatus.NOT_FOUND),
    SURVEY_NOT_FOUND(1017,"Survey does not exist",HttpStatus.NOT_FOUND),
    EMPLOYEE_NOT_FOUND(1015, "Employee not found!", HttpStatus.NOT_FOUND),
    VEHICLE_NOT_FOUND(1016, "Vehicle not found!", HttpStatus.NOT_FOUND),
    EMPLOYEE_NOT_EXISTED(1017, "Employee not existed!", HttpStatus.NOT_FOUND),
    EMPLOYEE_HAS_ASSIGNMENTS(1018,"Employee has assignment",HttpStatus.BAD_REQUEST)
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
//k
    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}
