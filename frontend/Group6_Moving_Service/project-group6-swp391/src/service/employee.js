import api from './axiosInstance';

const EMPLOYEE_API_BASE = '/api/employees';

export const employeeService = {
  // Lấy nhân viên "free"
  getFreeEmployees: async () => {
    try {
      const response = await api.get(`${EMPLOYEE_API_BASE}/status/free`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees by status:', error);
      throw error;
    }
  },

  // Lấy tất cả nhân viên
  getAllEmployees: async () => {
    try {
      const response = await api.get(EMPLOYEE_API_BASE);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  // Lấy nhân viên theo ID
  getEmployeeById: async (employeeId) => {
    try {
      const response = await api.get(`${EMPLOYEE_API_BASE}/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employee:', error);
      throw error;
    }
  }
};
