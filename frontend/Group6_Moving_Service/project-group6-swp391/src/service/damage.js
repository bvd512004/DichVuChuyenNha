import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
    };
}

export const damageApi = {
    // 📦 Tạo damage mới
    create: (payload) =>
        axios.post(`${API_BASE}/api/damages`, payload, {
            headers: getAuthHeaders(),
        }),
    //upload 
    // 📤 Upload ảnh từ máy tính (Multipart)
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return axios.post(`${API_BASE}/api/damages/upload`, formData, {
            headers: {
                Authorization: localStorage.getItem("token")
                    ? `Bearer ${localStorage.getItem("token")}`
                    : "",
                "Content-Type": "multipart/form-data",
            },
        });
    },


    // 📦 Lấy danh sách damage theo contract
    getByContract: (contractId) =>
        axios.get(`${API_BASE}/api/damages/contract/${contractId}`, {
            headers: getAuthHeaders(),
        }),
    //update 
    update: (damageId, payload) =>
        axios.put(`${API_BASE}/api/damages/${damageId}`, payload, {
            headers: getAuthHeaders(),
        }),

    //custoer

    sendManagerFeedback: (damageId, payload) =>
        axios.put(`${API_BASE}/api/damages/${damageId}/manager-feedback`, payload, {
            headers: getAuthHeaders(),
        }),

    sendCustomerFeedback: (damageId, payload) =>
        axios.put(`${API_BASE}/api/damages/${damageId}/feedback`, payload, {
            headers: getAuthHeaders(),
        }),


};


export default damageApi;
//l