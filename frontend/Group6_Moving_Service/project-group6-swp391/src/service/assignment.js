import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}

export const assignmentApi = {
  getAssignableContracts: () =>
    axios.get(`${API_BASE}/contracts`, { headers: getAuthHeaders() }),

  getEmployees: () =>
    axios.get(`${API_BASE}/employees/status/free`, { headers: getAuthHeaders() }),

  // Cập nhật để truyền thêm `assignDate` khi gán nhân viên vào hợp đồng
  assignEmployee: ({ contractId, employeeId, assignedDate }) =>
    axios.post(
      `${API_BASE}/assignments/assign`,
      {
        contractId,     // Gửi contractId trong body
        employeeId,     // Gửi employeeId trong body
        assignedDate,   // Gửi assignedDate trong body
      },
      {
        headers: getAuthHeaders(),
      }
    ),

  getAssignmentsByContract: (contractId) =>
    axios.get(`${API_BASE}/assignments/${contractId}`, { headers: getAuthHeaders() }),

  removeAssignment: (contractId, employeeId) =>
    axios.delete(`${API_BASE}/assignments/${contractId}/${employeeId}`, { headers: getAuthHeaders() }),
};

export default assignmentApi;
//final 