import api from "./axiosInstance";

const PaymentAPI = {
  // ✅ Gửi yêu cầu tạo thanh toán đặt cọc PayOS
  createDepositPayment: async (contractId) => {
    const res = await api.post(`/payments/deposit/${contractId}`);
    return res.data;
  },

  // ✅ (Tuỳ chọn) Lấy lịch sử thanh toán theo hợp đồng
  getPaymentsByContract: async (contractId) => {
    const res = await api.get(`/payments/contract/${contractId}`);
    return res.data;
  },
   createFinalPayment: async (contractId) => {
    const res = await api.post(`/payments/final/${contractId}`);
    return res.data;
  },

  getFinalPaymentInfo: async (contractId) => {
    const res = await api.get(`/payments/final/${contractId}`);
    return res.data;
  },
  // ✅ Lấy tất cả thanh toán cuối cùng của user
  getFinalPaymentsForUser: async () => {
    const res = await api.get(`/payments/final/me`);
    return res.data;
  },
};

export default PaymentAPI;
