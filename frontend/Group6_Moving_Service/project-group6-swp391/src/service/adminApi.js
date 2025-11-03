import axios from "axios";

const API_BASE = "http://localhost:8080/api/admin";

// Tạo instance
const api = axios.create({
    baseURL: API_BASE,
});

// Interceptor để set token dynamic từ localStorage mỗi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Thêm interceptor xử lý error (ví dụ 401 logout)
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            // Có thể redirect to login
            console.error("Unauthorized - Token expired");
            localStorage.removeItem("token");
        }
        return Promise.reject(err);
    }
);

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