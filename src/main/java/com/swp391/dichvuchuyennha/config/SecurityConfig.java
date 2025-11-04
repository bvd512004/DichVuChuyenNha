package com.swp391.dichvuchuyennha.config;

import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static org.springframework.http.HttpMethod.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final String[] PUBLIC_URL = {
            "/api/auth/**", // Login/logout
            "/api/users/customer-company",
            "/api/auth/**",
            "/api/public/**",
            "/api/test/public",
            "/api/users/**",
            "/api/manager/contracts/**",
            "/api/manager/view-contracts",
            "/api/employees/**", // Employee endpoints - temporarily public for testing
            "/api/vehicles/**", // Vehicle endpoints - temporarily public for testing
            "/api/assignments/**",
            "/api/contracts/**",
            "/api/surveys/**",
            "/api/requests/**",
            "/api/prices/**",
            "/api/quotations/**",
            "/api/quotation-services/**",
            "/api/request-assignment/**",
            "/api/work-progress/**",
            "/api/customer/work-progress/**",
            "/api/survey-floors/**",
            "/api/survey-images/**",
            "/images/survey/**",
            "/api/manager/quotations/**",
            "/api/damages/**",
            "/images/damages/**",
            "/api/chat-ai",
            "/api/roles" // API công khai lấy danh sách role
    };

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(PUBLIC_URL).permitAll()

                        // Admin endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/users").hasRole("ADMIN") // GET all users
                        .requestMatchers("/api/users/{userId}").hasRole("ADMIN") // PUT/DELETE
                        .requestMatchers("/api/work-progress/**").hasRole("MANAGER")

                        // Contract endpoints
                        .requestMatchers("/api/contracts/unsigned/me")
                        .hasAnyRole("CUSTOMER_INDIVIDUAL", "CUSTOMER_COMPANY")
                        .requestMatchers("/api/contracts/sign/{contractId}")
                        .hasAnyRole("CUSTOMER_INDIVIDUAL", "CUSTOMER_COMPANY", "MANAGER")
                        .requestMatchers("/api/contracts/**").hasRole("MANAGER")

                        // Damages endpoints
                        .requestMatchers(POST, "/api/damages").hasAnyRole("EMPLOYEE", "MANAGER")
                        .requestMatchers(PUT, "/api/damages/{damageId}")
                        .hasAnyRole("EMPLOYEE", "MANAGER")
                        .requestMatchers(GET, "/api/damages").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(GET, "/api/damages/{damageId}")
                        .hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                        .requestMatchers(DELETE, "/api/damages/{damageId}").hasRole("MANAGER")

                        // Request endpoints
                        .requestMatchers(POST, "/api/requests/create")
                        .hasAnyRole("CUSTOMER_INDIVIDUAL", "CUSTOMER_COMPANY")
                        .requestMatchers(GET, "/api/requests/my")
                        .hasAnyRole("CUSTOMER_INDIVIDUAL", "CUSTOMER_COMPANY")
                        .requestMatchers(GET, "/api/requests").hasAnyRole("MANAGER", "ADMIN")

                        // Survey endpoints
                        .requestMatchers(POST, "/api/surveys").hasRole("MANAGER")
                        .requestMatchers(GET, "/api/surveys").hasAnyRole("MANAGER", "ADMIN")

                        // User endpoints
                        .requestMatchers(GET, "/api/users/me").authenticated()
                        .requestMatchers(PUT, "/api/users/me").authenticated()
                        .requestMatchers(POST, "/api/users/create").hasRole("ADMIN")

                        // WorkProgress
                        .requestMatchers("/api/work-progress/**")
                        .hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")

                        // Default
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    // Các bean khác
    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(
                new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256")).build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthorityPrefix("ROLE_");
        converter.setAuthoritiesClaimName("scope"); // ← Dùng "scope"
        return new JwtAuthenticationConverter() {
            {
                setJwtGrantedAuthoritiesConverter(converter);
            }
        };
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.addAllowedOrigin("http://localhost:5173");
        corsConfiguration.setAllowCredentials(true); // quan trọng nếu gửi JWT qua cookie

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return new CorsFilter(source);
    }

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername("your-email@gmail.com");
        mailSender.setPassword("your-app-password");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");

        return mailSender;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }
}