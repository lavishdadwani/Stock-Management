import apiConfig from "./config.js"

const checkIn = () => apiConfig.client.post("attendance/check-in")

const checkOut = (data) => apiConfig.client.post("attendance/check-out", data)

const getCheckInStatus = () => apiConfig.client.get("attendance/check-in-status")

const getMyAttendanceHistory = (params) => apiConfig.client.get("attendance/my-history", {}, { params })

const getProducibleItems = () => apiConfig.client.get("attendance/producible-items")

export default {
  checkIn,
  checkOut,
  getCheckInStatus,
  getMyAttendanceHistory,
  getProducibleItems
}

