const toRequestParams = (obj) => {
  return Object.keys(obj)
    .filter((key) => obj[key] && obj[key].toString().trim() !== "")
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key].toString())}`)
    .join("&");
};

export default { toRequestParams };
