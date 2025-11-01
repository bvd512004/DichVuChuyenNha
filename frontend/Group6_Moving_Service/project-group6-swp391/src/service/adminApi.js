// src/services/adminApi.js
import axios from "axios";

const API_BASE = "http://localhost:8080/api/admin";
const token = localStorage.getItem("token");

const headers = {
    Authorization: `Bearer ${token}`,
};

// Tạo instance để dễ config sau
const api = axios.create({
    baseURL: API_BASE,
    headers,
});

export const adminApi = {
    // Users
    getUsers: () => api.get("/users").then((res) => res.data.result || []),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),

    // Roles
    getRoles: () => api.get("/roles").then((res) => res.data.result || []),

    // Vehicles
    getVehicles: () => api.get("/vehicles").then((res) => res.data.result || []),

    // Audit Logs
    getAuditLogs: () => api.get("/logs").then((res) => res.data.result || []),

    // Login History
    getLoginHistory: (userId) =>
        api.get(`/users/${userId}/login-history`).then((res) => res.data.result || []),

    // Create
    createAdmin: (data) => api.post("/users", data),
    createEmployee: (data) => api.post("/employees", data),
};