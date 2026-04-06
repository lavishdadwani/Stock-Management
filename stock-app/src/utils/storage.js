import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const saveAuth = async ({ token, user }) => {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, String(token));
  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearAuth = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
};