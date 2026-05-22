
import axios from "axios";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { clearAuth } from "../utils/storage";

const DEV_API_URL = "http://localhost:8000/api/";

function normalizeBaseUrl(url) {
  if (!url) return "";
  return url.endsWith("/") ? url : `${url}/`;
}

const API_BASE_URL = normalizeBaseUrl(
  process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? DEV_API_URL : "")
);

if (!API_BASE_URL && !__DEV__) {
  console.error(
    "[stock-app] EXPO_PUBLIC_API_URL is missing. Set it in EAS secrets or .env before building."
  );
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// REQUEST INTERCEPTOR (ADD TOKEN)
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (_error) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// RESPONSE (GLOBAL ERROR HANDLING)
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const res = error.response;

    if (res?.status === 403) {
      const message = res?.data?.message;

      if (message?.toLowerCase().includes("invalid token")) {
        await clearAuth();
        router.replace("/login");
        Alert.alert("Session expired", "Please login again.");
      }
    }

    return Promise.reject(error);
  }
);

export default client;
