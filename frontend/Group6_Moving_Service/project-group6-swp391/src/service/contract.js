import axiosInstance from "./axiosInstance";

const ContractAPI = {
  // Lấy hợp đồng theo ID
  getById: async (id) => {
    const res = await axiosInstance.get(`/contracts/${id}`);
    return res.data;
  },

  // Ký hợp đồng
  signContract: async (id, userId) => {
    const res = await axiosInstance.put(`/contracts/sign/${id}?userId=${userId}`);
    return res.data;
  },

  // Gán nhân viên vào hợp đồng
  assignEmployee: async (contractId, employeeId, assignedDate) => {
    const res = await axiosInstance.post(`/assignments/assign`, null, {
      params: {
        contractId,
        employeeId,
        assignedDate,
      },
    });
    return res.data;
  },

  // Lấy tất cả hợp đồng (cho manager)
  getAll: async () => {
    const res = await axiosInstance.get(`/contracts/manager`);
    return res;
  },
  
};
export default ContractAPI;
