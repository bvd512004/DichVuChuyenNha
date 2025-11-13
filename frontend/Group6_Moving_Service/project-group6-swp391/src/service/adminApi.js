// src/service/adminApi.js
import axios from "axios";

const API_BASE = "http://localhost:8080";

// Tạo instance chung
const api = axios.create({
    baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            console.error("Unauthorized - Token expired");
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export const adminApi = {
    // Users
    getUsers: () => api.get("/api/admin/users").then(r => r.data.result || []),
    updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/api/admin/users/${id}`),

    // Roles - DÙNG API CÔNG KHAI
    getRoles: () => api.get("/api/roles").then(r => r.data.result || []),

    // Vehicles
    getVehicles: () => api.get("/api/admin/vehicles").then(r => r.data.result || []),
    createVehicle: (data) => api.post("/api/admin/vehicles", data),

    // Audit Logs
    getAuditLogs: () => api.get("/api/admin/logs").then(r => r.data.result || []),

    // Login History
    getLoginHistory: (userId) =>
        api.get(`/api/admin/users/${userId}/login-history`).then(r => r.data.result || []),

    // Create
    createAdmin: (data) => api.post("/api/admin/users", data),
    createEmployee: (data) => api.post("/api/admin/employees", data),
};