// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // baseURL cho Spring Boot API
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
