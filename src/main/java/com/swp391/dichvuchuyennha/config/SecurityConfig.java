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
            "/api/auth/**",                    // Authentication endpoints
            "/api/users/customer-company",     // Customer registration
            "/api/public/**",                   // Public endpoints
            "/api/test/public",                // Test endpoint
            "/images/survey/**",
            "/api/chat-ai"// Static images
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .authorizeHttpRequests(auth -> auth
                        // ✅ Public endpoints - CHỈ NHỮNG ENDPOINT THỰC SỰ PUBLIC
                        .requestMatchers(PUBLIC_URL).permitAll()

                        // ✅ admin endpoints
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "admin")

                        // ✅ User endpoints
                        .requestMatchers(GET, "/api/users").hasAnyRole("ADMIN", "admin")
                        .requestMatchers(POST, "/api/users").hasAnyRole("ADMIN", "admin")
                        .requestMatchers(POST, "/api/users/create").permitAll() // Customer registration - public access
                        .requestMatchers(PUT, "/api/users/{userId}").hasAnyRole("ADMIN", "admin")
                        .requestMatchers(DELETE, "/api/users/{userId}").hasAnyRole("ADMIN", "admin")
                        .requestMatchers(GET, "/api/users/{userId}/history").hasAnyRole("ADMIN", "admin")
                        .requestMatchers(GET, "/api/users/me").authenticated()
                        .requestMatchers(PUT, "/api/users/me").authenticated()
                        .requestMatchers(GET, "/api/users/roles").permitAll() // Customer roles for registration

                        // ✅ Contract endpoints - Rule cụ thể phải đặt TRƯỚC rule tổng quát
                        .requestMatchers("/api/contracts/unsigned/me")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers("/api/contracts/my-signed")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers("/api/contracts/manager")
                        .hasAnyRole("MANAGER", "Manager", "manager", "ADMIN", "Admin", "admin")
                        .requestMatchers("/api/contracts/eligible").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "Manager", "manager", "ADMIN", "Admin", "admin")
                        .requestMatchers(PUT, "/api/contracts/sign/**").hasAnyRole("CUSTOMER", "customer_individual", "customer_company", "MANAGER", "Manager", "manager")
                        .requestMatchers(PUT, "/api/contracts/**").hasAnyRole("MANAGER", "Manager", "manager", "ADMIN", "Admin", "admin")
                        .requestMatchers(DELETE, "/api/contracts/**").hasAnyRole("MANAGER", "Manager", "manager", "ADMIN", "Admin", "admin")
                        .requestMatchers(POST, "/api/contracts").hasAnyRole("MANAGER", "Manager", "manager", "ADMIN", "Admin", "admin")
                        .requestMatchers(GET, "/api/contracts/**").hasAnyRole("CUSTOMER", "customer_individual", "customer_company", "EMPLOYEE", "employee", "MANAGER", "Manager", "manager", "ADMIN", "Admin", "admin")
                        .requestMatchers("/api/contracts/**").hasAnyRole("MANAGER", "Manager", "manager", "ADMIN", "Admin", "admin")

                        // ✅ Damages endpoints
                        .requestMatchers(POST, "/api/damages").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager")
                        .requestMatchers(PUT, "/api/damages/{damageId}")
                        .hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager")
                        .requestMatchers(GET, "/api/damages").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(GET, "/api/damages/{damageId}")
                        .hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(DELETE, "/api/damages/{damageId}").hasAnyRole("MANAGER", "manager")

                        // ✅ employee endpoints
                        .requestMatchers("/api/employees/**").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")

                        // ✅ Vehicle endpoints
                        .requestMatchers("/api/vehicles/**").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")

                        // ✅ Assignment endpoints
                        .requestMatchers("/api/assignments/**").hasAnyRole("MANAGER", "manager")
                        .requestMatchers("/api/vehicle-assignments/**").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers("/api/request-assignment/**").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")

                        // ✅ Driver endpoints
                        .requestMatchers("/api/driver/**").hasAnyRole("EMPLOYEE", "employee")

                        // ✅ Request endpoints
                        .requestMatchers(POST, "/api/requests/create")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers(GET, "/api/requests/my")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers(GET, "/api/requests/my-requests")
                        .hasAnyRole("EMPLOYEE", "employee")
                        .requestMatchers(GET, "/api/requests")
                        .hasAnyRole("MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(PUT, "/api/requests/{id}/status")
                        .hasAnyRole("MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(POST, "/api/requests/**").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(PUT, "/api/requests/**").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(DELETE, "/api/requests/**").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")

                        // ✅ Survey endpoints - Rule cụ thể phải đặt TRƯỚC rule tổng quát
                        .requestMatchers(GET, "/api/surveys/my").hasAnyRole("EMPLOYEE", "employee")
                        .requestMatchers(POST, "/api/surveys").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(GET, "/api/surveys").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(PUT, "/api/surveys/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(DELETE, "/api/surveys/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(GET, "/api/surveys/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers("/api/survey-floors/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers("/api/survey-images/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")

                        // ✅ Quotation endpoints - Rule cụ thể phải đặt TRƯỚC rule tổng quát
                        .requestMatchers(GET, "/api/quotations/me").hasAnyRole("EMPLOYEE", "employee")
                        .requestMatchers(GET, "/api/quotations/pending/me").hasAnyRole("customer_individual", "customer_company")
                        .requestMatchers(PUT, "/api/quotations/approve/{quotationId}").hasAnyRole("customer_individual", "customer_company")
                        .requestMatchers(POST, "/api/quotations").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(PUT, "/api/quotations/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(DELETE, "/api/quotations/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers(GET, "/api/quotations/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers("/api/quotation-services/**").hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")

                        // ✅ Price endpoints
                        .requestMatchers(GET, "/api/prices").permitAll() // Public pricing
                        .requestMatchers("/api/prices/**").hasAnyRole("MANAGER", "manager", "ADMIN", "admin")

                        // ✅ Work Progress endpoints
                        .requestMatchers("/api/work-progress/**")
                        .hasAnyRole("EMPLOYEE", "employee", "MANAGER", "manager", "ADMIN", "admin")
                        .requestMatchers("/api/customer/work-progress/**")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")

                        // ✅ manager specific endpoints
                        .requestMatchers("/api/manager/**").hasAnyRole("MANAGER", "manager")

                        // ✅ Chat AI endpoint
                         // Any authenticated user

                        // ✅ Default - deny all other requests
                        .anyRequest().authenticated()
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
        corsConfiguration.setAllowCredentials(true);

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
        return new BCryptPasswordEncoder();
    }
}
