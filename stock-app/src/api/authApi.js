import client from "./client";
import { clearAuth, saveAuth } from "../utils/storage";

const wrap = (response) => ({
  ok: response.status >= 200 && response.status < 300,
  data: response.data,
  status: response.status,
});

const normalizeError = (error) => {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const message = data?.message || data?.displayMessage || error?.message || "Request failed";
  return { ok: false, status: status || 0, data, message };
};

const login = async (credentials) => {
  try {
    const res = await client.post("user/login", credentials);
    const wrapped = wrap(res);
    const payload = wrapped.data?.data || wrapped.data || {};
    const { user, token } = payload;

    if (wrapped.ok && token) {
      await saveAuth({ token, user });
      return { ok: true, user, token, message: wrapped.data?.displayMessage || wrapped.data?.message };
    }

    return { ok: false, message: wrapped.data?.message || "Login failed" };
  } catch (e) {
    const err = normalizeError(e);
    return err;
  }
};

const logout = async () => {
  try {
    // best-effort: server clears token, but we always clear local auth
    await client.delete("user/logout");
  } catch {
    // ignore
  } finally {
    await clearAuth();
  }
  return { ok: true };
};

export default {
  login,
  logout,
};