import request from "../utils/request";
import client from "./client";
import axios from "axios";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra || Constants.manifest?.extra;

const GEOAPI = extra?.GEOAPI;
const GEOAPI_KEY = "f96462cc28394c1dbbc0465e25c7bfc2"

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
  try {
    const response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${GEOAPI_KEY}`);
      return response.data;
  } catch (error) {
    console.error("Error fetching city name:", error);
    throw error;
  }
};

export default {
  getStockTransferQuantities,
  getItemProduced,
  getCityName
};
