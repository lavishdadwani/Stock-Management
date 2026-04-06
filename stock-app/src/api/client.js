
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { clearAuth } from "../utils/storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/"
  // "https://stock-management-mciu.onrender.com/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// 🔐 REQUEST INTERCEPTOR (ADD TOKEN)
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        // config.headers.Authorization = token;
        // OR if backend expects Bearer:
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (_error) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// 🚨 RESPONSE (GLOBAL ERROR HANDLING)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const res = error.response;

    if (res?.status === 403) {
      const message = res?.data?.message;

      if (
        message?.toLowerCase().includes("invalid token")
      ) {
        // 🔥 CLEAR AUTH
        await clearAuth();

        // 🔥 REDIRECT TO LOGIN
        router.replace("/login");

        // 🔥 OPTIONAL ALERT
        alert("Session expired. Please login again.");
      }
    }

    return Promise.reject(error);
  }
);

export default client;