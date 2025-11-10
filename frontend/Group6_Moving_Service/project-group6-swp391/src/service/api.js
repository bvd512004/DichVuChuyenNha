// src/api/api.js
import axios from "axios";
import { message } from 'antd';

const api = axios.create({
  baseURL: "http://localhost:8080/api", // baseURL cho Spring Boot API
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor thêm token vào headers trước mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    return Promise.reject(error);
  }
);

export default api;
