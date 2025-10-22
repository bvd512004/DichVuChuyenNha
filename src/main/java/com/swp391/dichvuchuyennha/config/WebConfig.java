package com.swp391.dichvuchuyennha.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // /images/** là URL frontend có thể truy cập
        // file:///C:/uploads/ là folder trên server chứa ảnh
        registry.addResourceHandler("/images/survey/**")
                .addResourceLocations("file:///C:/SWP391/DichVuChuyenNha/uploads/survey/");
    }
}
