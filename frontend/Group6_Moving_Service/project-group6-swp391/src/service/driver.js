import api from "./axiosInstance";

export const driverApi = {
  getSchedules: async () => {
    const response = await api.get("/driver/schedule");
    return response.data;
  },
};


