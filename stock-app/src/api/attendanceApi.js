import client from "./client";
import request from "../utils/request";

const wrap = (response) => ({
  ok: response.status >= 200 && response.status < 300,
  data: response.data,
  status: response.status,
});

/**
 * Check-in. Optional body:
 * - checkInPhoto: base64 data URL or image URL string
 * - lat, lng
 */
const checkIn = (data = {}) =>
  client.post("attendance/check-in", data).then(wrap);

const checkOut = (data) =>
  client.post("attendance/check-out", data).then(wrap);

const getCheckInStatus = () =>
  client.get("attendance/check-in-status").then(wrap);

const getMyAttendanceHistory = (params) => {
  let queryString = "";
  if (params) {
    queryString = "?" + request.toRequestParams(params);
  }
  return client.get(`attendance/my-history${queryString}`).then(wrap);
};

export default {
  checkIn,
  checkOut,
  getCheckInStatus,
  getMyAttendanceHistory,
};
