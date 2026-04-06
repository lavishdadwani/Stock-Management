// src/screens/LoginScreen.js
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import authApi from "../api/authApi";
import { saveToken } from "../utils/storage";
import { validateLogin } from "../utils/validations";
export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    const validationErrors = validateLogin({ email, password });
    console.log("start");

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await authApi.login({ email, password });
      // if (result.user) {
        router.replace("/dashboard");
      // } else {
      //   if (result.errors) {
      //     setErrors(result.errors);
      //   } else {
      //     Alert.alert("Error", result.message);
      //   }
      // }
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: null }));
        }}
      />

      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: null }));
        }}
      />

      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <Button
        title={isLoading ? "Loading..." : "Login"}
        onPress={onSubmit}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
