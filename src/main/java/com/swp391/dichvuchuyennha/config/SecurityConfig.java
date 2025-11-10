package com.swp391.dichvuchuyennha.config;

import java.util.Properties;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static org.springframework.http.HttpMethod.DELETE;
import static org.springframework.http.HttpMethod.GET;
import static org.springframework.http.HttpMethod.POST;
import static org.springframework.http.HttpMethod.PUT;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
            "/api/admin/**",
            "/api/request-assignment/**",
            "/api/work-progress/**",
            "/api/customer/work-progress/**",
            "/api/survey-floors/**",
            "/api/survey-images/**",
            "/images/survey/**",
            "/api/manager/quotations/**",
            "/api/damages/**",
            "/images/damages/**",
            "/api/payments/**",
            "/api/chat-ai"};






    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .authorizeHttpRequests(auth -> auth


                                // Admin endpoints
                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                .requestMatchers("/api/users").hasRole("ADMIN") // GET all users
                                .requestMatchers("/api/users/{userId}").hasRole("ADMIN") // PUT/DELETE
                                .requestMatchers("/api/work-progress/**").hasRole("MANAGER")                                                      // user
//                                                .requestMatchers("/api/assignments/**").hasRole("MANAGER") //moi
                                // Assignment endpoints
//                                                .requestMatchers(POST, "/api/assignments/assign").hasRole("MANAGER")
                                .requestMatchers("PATCH", "/api/work-progress/{progressId}/status").hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
//                                                .requestMatchers("/api/assignments").hasRole("ADMIN")
                                // ✅ Customer có thể tạo payment


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

                                // Employee endpoints - temporarily disabled for testing
                                // .requestMatchers("/api/employees").hasAnyRole("MANAGER", "ADMIN")

                                // Request endpoints
                                .requestMatchers(POST, "/api/requests/create")
                                .hasAnyRole("CUSTOMER_INDIVIDUAL", "CUSTOMER_COMPANY")
                                .requestMatchers(GET, "/api/requests/my")
                                .hasAnyRole("CUSTOMER_INDIVIDUAL", "CUSTOMER_COMPANY")
                                .requestMatchers(GET, "/api/requests/my-requests")
                                .hasRole("EMPLOYEE") // ✅ Cho phép EMPLOYEE với position Surveyer
                                .requestMatchers(GET, "/api/requests").hasAnyRole("MANAGER", "ADMIN")

                                // Survey endpoints
                                .requestMatchers(POST, "/api/surveys")
                                .hasAnyRole("EMPLOYEE", "MANAGER") // ✅ Cho phép EMPLOYEE và MANAGER (chi tiết kiểm tra trong @PreAuthorize)
                                .requestMatchers(GET, "/api/surveys/my")
                                .hasRole("EMPLOYEE") // ✅ Cho phép EMPLOYEE với position Surveyer
                                .requestMatchers(GET, "/api/surveys").hasAnyRole("MANAGER", "ADMIN")

                                // Quotation endpoints
                                .requestMatchers(GET, "/api/quotations/me")
                                .hasRole("EMPLOYEE") // ✅ Cho phép EMPLOYEE với position Surveyer

                                // User endpoints
                                .requestMatchers(GET, "/api/users/me").authenticated()
                                .requestMatchers(PUT, "/api/users/me").authenticated()
                                .requestMatchers(POST, "/api/users/create").hasRole("ADMIN")
                                .requestMatchers(GET, "/api/users/roles").permitAll() // ✅ Cho phép public để đăng ký

                                // Vehicles endpoints - chỉ manager mới có thể gán xe
                                .requestMatchers(GET, "/api/vehicles/available").hasRole("MANAGER")
                                .requestMatchers(GET, "/api/vehicles/contract/**").hasRole("MANAGER")
                                .requestMatchers(POST, "/api/vehicles/assign").hasRole("MANAGER")
                                .requestMatchers(DELETE, "/api/vehicles/assign/**").hasRole("MANAGER")

                                // WorkProgress (nếu có)
                                .requestMatchers("/api/work-progress/**")
                                .hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")

                                // Driver endpoints
                                .requestMatchers("/api/driver/**").hasRole("EMPLOYEE")

                                .requestMatchers("/api/roles").hasRole("ADMIN")

                                // Public endpoints
                                .requestMatchers(PUBLIC_URL).permitAll()
                                .requestMatchers("/api/roles").permitAll()
                        // Default
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(
                                        jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(
                new SecretKeySpec(jwtSecret.getBytes(), "HmacSHA256")).build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
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
                props.put("mail.debug", "true"); // để debug

                return mailSender;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
//                 return new BCryptPasswordEncoder(); // Đổi sang BCrypt
        return NoOpPasswordEncoder.getInstance();
        }

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
        props.put("mail.debug", "true"); // để debug

        return mailSender;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // ✅ Dùng BCrypt để mã hóa password
        // return NoOpPasswordEncoder.getInstance(); // ❌ Không an toàn - chỉ dùng để test
    }

}