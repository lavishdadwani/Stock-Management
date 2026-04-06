import apiConfig from "./config.js"
import request from "../src/utils/request.js"

const checkIn = () => apiConfig.client.post("attendance/check-in")

const checkOut = (data) => apiConfig.client.post("attendance/check-out", data)

const getCheckInStatus = () => apiConfig.client.get("attendance/check-in-status")

const getMyAttendanceHistory = (params) => apiConfig.client.get("attendance/my-history", {}, { params })

const getProducibleItems = () => apiConfig.client.get("attendance/producible-items")

const getUserAttendanceHistory = (userId, params) => {
  let queryString = ""
  if (params && Object.keys(params).length > 0) {
    queryString = "?" + request.toRequestParams(params)
  }
  return apiConfig.client.get(`attendance/user/${userId}/history${queryString}`)
}

const getAttendanceRecord = (attendanceId) =>
  apiConfig.client.get(`attendance/record/${attendanceId}`)

export default {
  checkIn,
  checkOut,
  getCheckInStatus,
  getMyAttendanceHistory,
  getProducibleItems,
  getUserAttendanceHistory,
  getAttendanceRecord
}

