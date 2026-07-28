export const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const parseBlobError = async (blob, fallbackMessage) => {
  try {
    const text = await blob.text();
    const json = JSON.parse(text);
    return json.displayMessage || json.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};
