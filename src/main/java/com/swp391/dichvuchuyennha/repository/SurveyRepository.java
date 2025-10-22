package com.swp391.dichvuchuyennha.repository;

import com.swp391.dichvuchuyennha.entity.Surveys;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<Surveys, Integer> {
    @Query("SELECT s FROM Surveys s " +
            "JOIN s.request r " +
            "JOIN r.assignedEmployees a " +
            "WHERE a.employee.user.username = :username ")
    List<Surveys> findSurveysByEmployeeAndStatus(@Param("username") String username);

}
