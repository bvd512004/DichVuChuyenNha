package com.swp391.dichvuchuyennha.mapper;

import com.swp391.dichvuchuyennha.dto.request.UserCreateRequest;
import com.swp391.dichvuchuyennha.dto.response.UserResponse;
import com.swp391.dichvuchuyennha.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    Users toUsers(UserCreateRequest request);   // map từ request sang entity


    @Mapping(target = "userId", ignore = true) // Assuming userId is auto-generated
    @Mapping(target = "employee", ignore = true) // Assuming these are handled elsewhere

    @Mapping(target = "customerCompany", ignore = true)
    @Mapping(target = "contractsSigned", ignore = true)
    @Mapping(target = "feedbacks", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "requests", ignore = true)
    Users toUsersCreateRequest(UserCreateRequest request);


    UserResponse toUserResponse(Users users);
}