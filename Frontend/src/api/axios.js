// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  withCredentials: false, // pakai token, bukan cookie
});

// Tambahkan token otomatis ke semua request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");

    console.log("TOKEN YANG DIKIRIM:", token); // debug

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
        