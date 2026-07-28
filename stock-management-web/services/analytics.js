import apiConfig from "./config.js"

const getOverview = (params) => apiConfig.client.get("analytics/overview", {}, { params })
const getSalesTrend = (params) => apiConfig.client.get("analytics/sales-trend", {}, { params })
const getMaterialUsageTrend = (params) => apiConfig.client.get("analytics/material-usage", {}, { params })
const getProductionSummary = (params) => apiConfig.client.get("analytics/production-summary", {}, { params })

export default {
    getOverview,
    getSalesTrend,
    getMaterialUsageTrend,
    getProductionSummary
}
