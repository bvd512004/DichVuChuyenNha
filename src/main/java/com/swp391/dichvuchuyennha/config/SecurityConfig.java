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

                        // ✅ Admin endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ✅ User endpoints
                        .requestMatchers(GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(POST, "/api/users").hasRole("ADMIN")
                        .requestMatchers(POST, "/api/users/create").permitAll() // Customer registration - public access
                        .requestMatchers(PUT, "/api/users/{userId}").hasRole("ADMIN")
                        .requestMatchers(DELETE, "/api/users/{userId}").hasRole("ADMIN")
                        .requestMatchers(GET, "/api/users/me").authenticated()
                        .requestMatchers(PUT, "/api/users/me").authenticated()
                        .requestMatchers(GET, "/api/users/roles").permitAll() // Customer roles for registration

                        // ✅ Contract endpoints
                        .requestMatchers("/api/contracts/unsigned/me")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers("/api/contracts/sign/{contractId}")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company", "MANAGER")
                        .requestMatchers("/api/contracts/**").hasRole("MANAGER")

                        // ✅ Damages endpoints
                        .requestMatchers(POST, "/api/damages").hasAnyRole("EMPLOYEE", "MANAGER")
                        .requestMatchers(PUT, "/api/damages/{damageId}")
                        .hasAnyRole("EMPLOYEE", "MANAGER")
                        .requestMatchers(GET, "/api/damages").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(GET, "/api/damages/{damageId}")
                        .hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                        .requestMatchers(DELETE, "/api/damages/{damageId}").hasRole("MANAGER")

                        // ✅ Employee endpoints
                        .requestMatchers("/api/employees/**").hasAnyRole("MANAGER", "ADMIN")

                        // ✅ Vehicle endpoints
                        .requestMatchers("/api/vehicles/**").hasAnyRole("MANAGER", "ADMIN")

                        // ✅ Assignment endpoints
                        .requestMatchers("/api/assignments/**").hasRole("MANAGER")
                        .requestMatchers("/api/vehicle-assignments/**").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers("/api/request-assignment/**").hasRole("MANAGER")

                        // ✅ Request endpoints
                        .requestMatchers(POST, "/api/requests/create")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers(GET, "/api/requests/my")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers(GET, "/api/requests").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers("/api/requests/**").hasAnyRole("MANAGER", "ADMIN")

                        // ✅ Survey endpoints
                        .requestMatchers(POST, "/api/surveys").hasRole("MANAGER")
                        .requestMatchers(GET, "/api/surveys").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers("/api/surveys/my").hasRole("EMPLOYEE") // Surveyer only
                        .requestMatchers("/api/surveys/**").hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                        .requestMatchers("/api/survey-floors/**").hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                        .requestMatchers("/api/survey-images/**").hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")

                        // ✅ Quotation endpoints
                        .requestMatchers(POST, "/api/quotations").hasRole("MANAGER")
                        .requestMatchers(GET, "/api/quotations/me").hasRole("EMPLOYEE") // Surveyer
                        .requestMatchers(GET, "/api/quotations/pending/me").hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers(PUT, "/api/quotations/approve/{quotationId}").hasAnyRole("CUSTOMER", "customer_individual", "customer_company")
                        .requestMatchers("/api/quotations/**").hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                        .requestMatchers("/api/quotation-services/**").hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")

                        // ✅ Price endpoints
                        .requestMatchers(GET, "/api/prices").permitAll() // Public pricing
                        .requestMatchers("/api/prices/**").hasAnyRole("MANAGER", "ADMIN")

                        // ✅ Work Progress endpoints
                        .requestMatchers("/api/work-progress/**")
                        .hasAnyRole("EMPLOYEE", "MANAGER", "ADMIN")
                        .requestMatchers("/api/customer/work-progress/**")
                        .hasAnyRole("CUSTOMER", "customer_individual", "customer_company")

                        // ✅ Manager specific endpoints
                        .requestMatchers("/api/manager/**").hasRole("MANAGER")

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
