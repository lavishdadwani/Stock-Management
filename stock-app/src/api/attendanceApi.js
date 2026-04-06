import client from "./client";

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

export default {
  checkIn,
  checkOut,
  getCheckInStatus,
};
