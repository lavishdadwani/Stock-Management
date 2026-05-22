import request from "../utils/request";
import client from "./client";
import axios from "axios";

const wrap = (response) => ({
  ok: response.status >= 200 && response.status < 300,
  data: response.data,
  status: response.status,
});

const getItemProduced = (params) => {
  let queryString = "";
  if (params) {
    queryString = "?" + request.toRequestParams(params);
  }
  return client.get(`item-produced/totals${queryString}`).then(wrap);
};

const getStockTransferQuantities = (params) => {
  let queryString = "";
  if (params) {
    queryString = "?" + request.toRequestParams(params);
  }
  return client.get(`stock-transfer/get-quantities${queryString}`).then(wrap);
};

export const getCityName = async (lat, lon) => {
  const apiKey = process.env.EXPO_PUBLIC_GEOAPI_KEY;
  if (!apiKey) {
    if (__DEV__) {
      console.warn("[stock-app] EXPO_PUBLIC_GEOAPI_KEY is not set; skipping geocoding.");
    }
    return null;
  }
  if (lat == null || lon == null) {
    return null;
  }

  try {
    const response = await axios.get(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`
    );
    return response.data;
  } catch (error) {
    if (__DEV__) {
      console.error("Error fetching city name:", error);
    }
    throw error;
  }
};

export default {
  getStockTransferQuantities,
  getItemProduced,
  getCityName,
};
