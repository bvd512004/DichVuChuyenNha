package com.swp391.dichvuchuyennha.entity;

import jakarta.persistence.*;
import lombok.*;
import net.minidev.json.annotate.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {
        "role", "employee", "customerCompany",
        "requests", "contractsSigned", "feedbacks", "notifications"
})
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Roles role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)


    private Employee employee;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)


    private CustomerCompany customerCompany;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)


    private List<Requests> requests;

    @OneToMany(mappedBy = "signedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)


    private List<Contract> contractsSigned;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)


    private List<Feedbacks> feedbacks;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)


    private List<Notification> notifications;
}
