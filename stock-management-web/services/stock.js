import apiConfig from "./config.js"

const create = (data) => apiConfig.client.post("stock/create",data)

const edit = (id, data) => apiConfig.client.put(`stock/update/${id}`,data)

const deleteStock = (id) => apiConfig.client.delete(`stock/delete/${id}`)

const get_all = (data) => apiConfig.client.get("stock/get-all",data)
const getQuantities = (data) => apiConfig.client.get("stock/get-all-quantities",data)


export default {
    create,
    edit,
    deleteStock,
    get_all,
    getQuantities
}