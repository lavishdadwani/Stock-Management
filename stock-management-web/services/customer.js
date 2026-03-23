import request from "../src/utils/request.js";
import apiConfig from "./config.js";

const createCustomer = (data) => apiConfig.client.post("customer/create", data);

const getAllCustomers = (params) => {
  let queryString = "";
  if (params) {
    queryString = "?" + request.toRequestParams(params);
  }
  return apiConfig.client.get(`customer/get-all${queryString}`);
};

const getCustomerById = (id) => apiConfig.client.get(`customer/${id}`);

const updateCustomer = (id, data) => apiConfig.client.put(`customer/update/${id}`, data);

const deleteCustomer = (id) => apiConfig.client.delete(`customer/delete/${id}`);

export default {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};

