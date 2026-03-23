import request from "../src/utils/request.js";
import apiConfig from "./config.js";

const createSale = (data) => apiConfig.client.post("sales/create", data);

const getAllSales = (params) => {
  let queryString = "";
  if (params) {
    queryString = "?" + request.toRequestParams(params);
  }
  return apiConfig.client.get(`sales/get-all${queryString}`);
};

const getSaleById = (id) => apiConfig.client.get(`sales/${id}`);

const updateSale = (id, data) => apiConfig.client.put(`sales/update/${id}`, data);

const deleteSale = (id) => apiConfig.client.delete(`sales/delete/${id}`);

const getAvailableItems = () => apiConfig.client.get("sales/available-items");

export default {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  getAvailableItems
};

