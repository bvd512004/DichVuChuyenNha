import api from "./api";

const ContractAPI = {
  // Lấy hợp đồng theo ID
  getById: async (id) => {
    const res = await api.get(`/contracts/${id}`); // ✅
    return res.data;
  },

  // Ký hợp đồng
  signContract: async (id, userId) => {
    const res = await api.put(`/contracts/sign/${id}?userId=${userId}`); // ✅
    return res.data;
  },

  // Gán nhân viên vào hợp đồng
  assignEmployee: async (contractId, employeeId, assignedDate) => {
    const res = await api.post(`/assignments/assign`, null, { // null vì body không cần gửi
      params: {              // Gửi tham số dưới dạng query params
        contractId,
        employeeId,
        assignedDate,
      },
    });
    return res.data;
  },
  
};
export default ContractAPI;
