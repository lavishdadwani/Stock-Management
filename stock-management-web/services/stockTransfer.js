import request from "../src/utils/request.js"
import apiConfig from "./config.js"

const transferStock = (data) => apiConfig.client.post("stock-transfer/transfer", data)

const getAllStockTransfers = (params) => {
  let queryString = "";
  if(params && Object.keys(params).length > 0){
    queryString = "?" + request.toRequestParams(params)
  }
  return apiConfig.client.get(`stock-transfer/get-all${queryString}`)
}

const getMyStockTransfers = (params) =>{
  let queryString = "";
  if(params){
    queryString = "?" + request.toRequestParams(params)
  }
  return apiConfig.client.get(`stock-transfer/my-transfers${queryString}`)
} 

const getStockTransferById = (id) => apiConfig.client.get(`stock-transfer/${id}`)

const updateStockTransfer = (id, data) => apiConfig.client.put(`stock-transfer/update/${id}`, data)

const deleteStockTransfer = (id) => apiConfig.client.delete(`stock-transfer/delete/${id}`)

const getStockTransferQuantities = (params) => {
  let queryString = "";
  if(params){
    queryString = "?" + request.toRequestParams(params)
  }
  return apiConfig.client.get(`stock-transfer/get-quantities${queryString}`)
}

export default {
  transferStock,
  getAllStockTransfers,
  getMyStockTransfers,
  getStockTransferById,
  updateStockTransfer,
  deleteStockTransfer,
  getStockTransferQuantities
}

