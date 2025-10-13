// src/service/workprogress.js
import axios from "axios";

// 📡 API backend
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// 🔑 Hàm tạo header có token
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}

// 📦 API xử lý tiến độ công việc
export const workProgressApi = {
  // ----------------- 📦 EMPLOYEE -----------------

  // 📍 Lấy danh sách tiến độ của nhân viên hiện tại
  getMyList: () => {
    return axios.get(`${API_BASE}/api/work-progress`, {
      headers: getAuthHeaders(),
    });
  },

  // 📍 Tạo tiến độ mới
  create: (payload) => {
    return axios.post(`${API_BASE}/api/work-progress`, payload, {
      headers: getAuthHeaders(),
    });
  },

  // 📍 Cập nhật toàn bộ tiến độ
  update: (id, payload) => {
    return axios.put(`${API_BASE}/api/work-progress/${id}`, payload, {
      headers: getAuthHeaders(),
    });
  },

  // 📍 Cập nhật trạng thái nhanh
  updateStatus: (id, status) => {
    return axios.patch(`${API_BASE}/api/work-progress/${id}/status`, null, {
      params: { status },
      headers: getAuthHeaders(),
    });
  },

  // 📍 Xóa tiến độ
  remove: (id) => {
    return axios.delete(`${API_BASE}/api/work-progress/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  // ----------------- 👤 CUSTOMER -----------------

  // 📍 Lấy danh sách tiến độ của khách hàng hiện tại
  getCustomerList: () => {
    return axios.get(`${API_BASE}/api/customer/work-progress`, {
      headers: getAuthHeaders(),
    });
  },

  // 📍 Lấy tiến độ theo ID hợp đồng
  getByContract: (contractId) => {
    return axios.get(`${API_BASE}/api/customer/work-progress/${contractId}`, {
      headers: getAuthHeaders(),
    });
  },
};

export default workProgressApi;
