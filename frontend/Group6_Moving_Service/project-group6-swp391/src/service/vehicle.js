import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}

export const vehicleApi = {
  // Lấy danh sách hợp đồng đã ký (cho manager gán xe)
  getSignedContracts: () =>
    axios.get(`${API_BASE}/contracts/manager`, { headers: getAuthHeaders() }),

  // Lấy danh sách xe có sẵn
  getAvailableVehicles: () =>
    axios.get(`${API_BASE}/vehicles/available`, { headers: getAuthHeaders() }),

  // Lấy danh sách tài xế rảnh
  getAvailableDrivers: () =>
    axios.get(`${API_BASE}/vehicles/available-drivers`, { headers: getAuthHeaders() }),

  // Lấy xe đã được gán cho hợp đồng (qua quotation)
  getVehiclesByContract: (contractId) =>
    axios.get(`${API_BASE}/vehicles/contract/${contractId}`, { headers: getAuthHeaders() }),

  // Gán xe cho hợp đồng (qua quotation)
  assignVehicleToContract: ({ contractId, vehicleId, driverId }) =>
    axios.post(
      `${API_BASE}/vehicles/assign`,
      {
        contractId,
        vehicleId,
        driverId,
      },
      {
        headers: getAuthHeaders(),
      }
    ),

  assignDriverToVehicle: ({ contractId, vehicleId, driverId }) =>
    axios.post(
      `${API_BASE}/vehicles/assign-driver`,
      {
        contractId,
        vehicleId,
        driverId,
      },
      {
        headers: getAuthHeaders(),
      }
    ),

  // Hủy gán xe khỏi hợp đồng
  unassignVehicleFromContract: (contractId, vehicleId) =>
    axios.delete(`${API_BASE}/vehicles/assign/${contractId}/${vehicleId}`, { 
      headers: getAuthHeaders() 
    }),
};

export default vehicleApi;

