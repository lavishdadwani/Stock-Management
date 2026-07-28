import apiConfig from "./config.js"

const getAll = (params) => apiConfig.client.get("activity-log", params)

export default {
    getAll
}
