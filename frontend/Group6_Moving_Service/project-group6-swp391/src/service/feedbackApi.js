import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
    };
}

export const feedbackApi = {
    // 📦 Gửi feedback từ khách hàng
    sendFeedback: (payload) =>
        axios.post(`${API_BASE}/api/feedback`, payload, {
            headers: getAuthHeaders(),
        }),
        getAllFeedbacks: () =>
        axios.get(`${API_BASE}/api/feedback`, {
            headers: getAuthHeaders(),
        }),
};

export default feedbackApi;
