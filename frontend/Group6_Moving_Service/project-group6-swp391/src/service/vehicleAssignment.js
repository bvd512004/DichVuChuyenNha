import api from "./api";

const VehicleAssignmentAPI = {
  // Gán xe vào hợp đồng
  assignVehicle: async (contractId, vehicleId, assignedDate) => {
    const res = await api.post(`/vehicle-assignments/assign`, {
      contractId,
      vehicleId,
      assignedDate,
    });
    return res.data;
  },

  // Lấy danh sách xe đã được gán cho hợp đồng
  getAssignedVehicles: async (contractId) => {
    const res = await api.get(`/vehicle-assignments/${contractId}`);
    return res.data;
  },

  // Lấy danh sách xe có sẵn
  getAvailableVehicles: async () => {
    const res = await api.get(`/vehicle-assignments/available`);
    return res.data;
  },

  // Bỏ gán xe khỏi hợp đồng
  unassignVehicle: async (contractId, vehicleId) => {
    const res = await api.delete(`/vehicle-assignments/unassign`, {
      params: { contractId, vehicleId },
    });
    return res.data;
  },
};

export default VehicleAssignmentAPI;

