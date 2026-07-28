// src/screens/LoginScreen.js
import { View, Text, TextInput, StyleSheet, Alert, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import authApi from "../api/authApi";
import { validateLogin } from "../utils/validations";
import { shadow } from "../constants/shadow";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
        <View style={styles.logoWrap}>
          <Ionicons name="cube" size={30} color="#fff" />
        </View>

        <Text style={styles.title}>Stock Management</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@company.com"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          style={[
            styles.input,
            focusedField === "email" && styles.inputFocused,
            errors.email && styles.inputError,
          ]}
          value={email}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
          onChangeText={(text) => {
            setEmail(text);
            setErrors((prev) => ({ ...prev, email: null }));
          }}
        />
        {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          editable={!isLoading}
          style={[
            styles.input,
            focusedField === "password" && styles.inputFocused,
            errors.password && styles.inputError,
          ]}
          value={password}
          onFocus={() => setFocusedField("password")}
          onBlur={() => setFocusedField(null)}
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

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: spacing.xl,
      backgroundColor: colors.background,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: spacing.xl,
      ...shadow(3),
    },
    logoWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: spacing.lg,
      ...shadow(4),
    },
    title: { ...typography.h1, textAlign: "center", color: colors.text },
    subtitle: {
      ...typography.body,
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
      color: colors.textMuted,
      textAlign: "center",
    },
    label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderRadius: 10,
      marginBottom: spacing.sm,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    inputFocused: { borderColor: colors.primary, borderWidth: 1.5 },
    inputError: { borderColor: colors.danger },
    error: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
    button: {
      marginTop: spacing.xs,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonPressed: { opacity: 0.9 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { ...typography.bodyBold, color: "#fff" },
  });
