import client from "./client";
import AsyncStorage from "@react-native-async-storage/async-storage";

const login = async (credentials) => {
  const result = await client.post("user/login", credentials);
  try {
    console.log(result)
    if (result.data) {
      const { user, token } = result.data.data || result.data;
      console.log(token);
      
      if (token) {
        AsyncStorage.setItem("token", token);
      }
      if (user) {
        AsyncStorage.setItem("user", JSON.stringify(user));
      }
      return { user, token };
    }
  } catch (error) {
    return "Login failed";
  }
};

export default {
  login,
};
