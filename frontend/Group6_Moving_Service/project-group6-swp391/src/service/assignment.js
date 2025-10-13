// src/service/assignment.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}

export const assignmentApi = {
  // NOTE: Bạn cần backend cung cấp endpoint này (hoặc đổi sang endpoint hiện có)
  // Lấy danh sách các hợp đồng đã ký / có thể phân công
  getAssignableContracts: () => {
    return axios.get(`${API_BASE}/api/manager/contracts/assignable`, {
      headers: getAuthHeaders(),
    });
  },

  // NOTE: Endpoint lấy danh sách nhân viên khả dụng. Nếu backend có endpoint khác, chỉnh lại.
  getEmployees: () => {
    return axios.get(`${API_BASE}/api/manager/employees`, {
      headers: getAuthHeaders(),
    });
  },

  // Gán nhiều nhân viên cho một hợp đồng
  assignEmployees: (payload) => {
    // payload = { contractId: 1, employeeIds: [2,3], assignedTime: "2025-09-29" (opt) }
    return axios.post(`${API_BASE}/api/manager/assignments`, payload, {
      headers: getAuthHeaders(),
    });
  },

  // Lấy danh sách assignment của 1 contract
  getAssignmentsByContract: (contractId) => {
    return axios.get(`${API_BASE}/api/manager/assignments/${contractId}`, {
      headers: getAuthHeaders(),
    });
  },

  // Xóa 1 assignment (contractId + employeeId)
  removeAssignment: (contractId, employeeId) => {
    return axios.delete(`${API_BASE}/api/manager/assignments/${contractId}/${employeeId}`, {
      headers: getAuthHeaders(),
    });
  },
};

export default assignmentApi;
