import client from "./client";

const wrap = (response) => ({
  ok: response.status >= 200 && response.status < 300,
  data: response.data,
  status: response.status,
});

const getProducibleItems = () => client.get("producible-items").then(wrap);

export default {
  getProducibleItems,
};
