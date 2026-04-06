// src/screens/LoginScreen.js
import { View, Text, TextInput, StyleSheet, Alert, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import authApi from "../api/authApi";
import { validateLogin } from "../utils/validations";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    const validationErrors = validateLogin({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await authApi.login({ email, password });
      if (result.ok) {
        router.replace("/dashboard");
        return;
      }

      const msg = result.message || "Login failed. Please try again.";
      const inactive = typeof msg === "string" && msg.toLowerCase().includes("inactive");
      Alert.alert(inactive ? "Account inactive" : "Login failed", msg);
    } catch (err) {
      Alert.alert("Error", err?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Stock Management</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@company.com"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: null }));
          }}
        />
        {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Password"
          secureTextEntry
          editable={!isLoading}
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: null }));
          }}
        />
        {!!errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <Pressable
          onPress={onSubmit}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.button,
            (pressed || isLoading) && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>{isLoading ? "Signing in…" : "Sign in"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f3f6fb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  subtitle: { marginTop: 6, marginBottom: 18, color: "#6b7280", textAlign: "center" },
  label: { fontSize: 12, color: "#374151", marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#ef4444" },
  error: { color: "#ef4444", marginBottom: 10 },
  button: {
    marginTop: 6,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonPressed: { opacity: 0.9 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
