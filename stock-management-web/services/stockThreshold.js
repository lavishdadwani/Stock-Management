import apiConfig from "./config.js"

const getAll = () => apiConfig.client.get("stock-threshold")
const set = (data) => apiConfig.client.post("stock-threshold", data)

export default {
    getAll,
    set
}
