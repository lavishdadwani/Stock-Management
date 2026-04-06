import client from "./client";
import request from "../utils/request";

const wrap = (response) => ({
  ok: response.status >= 200 && response.status < 300,
  data: response.data,
  status: response.status,
});

const getMyTransfers = (params) => {
  let queryString = "";
  if (params) {
    queryString = "?" + request.toRequestParams(params);
  }
  return client.get(`stock-transfer/my-transfers${queryString}`).then(wrap);
};

export default {
  getMyTransfers,
};

