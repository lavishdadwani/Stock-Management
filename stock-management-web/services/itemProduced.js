import request from "../src/utils/request.js";
import apiConfig from "./config.js";

const getAllItemProduced = (params) => {
  let queryString = "";
  if (params) {
    queryString = "?" + request.toRequestParams(params);
  }
  return apiConfig.client.get(`item-produced/get-all${queryString}`);
};

const getItemProducedTotals = () => apiConfig.client.get('item-produced/totals');

const purchaseFromCustomer = (data) =>
  apiConfig.client.post('item-produced/purchase-from-customer', data);

export default {
  getAllItemProduced,
  getItemProducedTotals,
  purchaseFromCustomer
};

