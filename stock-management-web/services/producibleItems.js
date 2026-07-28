import apiConfig from "./config.js"

const getActive = () => apiConfig.client.get("producible-items")
const getAll = () => apiConfig.client.get("producible-items/all")
const create = (data) => apiConfig.client.post("producible-items/create", data)
const update = (id, data) => apiConfig.client.put(`producible-items/update/${id}`, data)
const deleteItem = (id) => apiConfig.client.delete(`producible-items/delete/${id}`)

export default {
    getActive,
    getAll,
    create,
    update,
    deleteItem
}
