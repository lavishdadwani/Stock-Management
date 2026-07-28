// src/components/layout/AppHeader.js
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadow } from "../../constants/shadow";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useTheme } from "../../context/ThemeContext";

export default function AppHeader({ onMenuPress, initials = "U" }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={onMenuPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.brand}>
        <Ionicons name="cube" size={18} color={colors.primary} />
        <Text style={styles.title}>Stock</Text>
      </View>

      <View style={styles.right}>
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
      </View>

    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      ...shadow(4),
    },
    brand: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    title: {
      ...typography.h2,
      color: colors.text,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: "#fff",
      fontWeight: "bold",
    },
    right: {
      minWidth: 36,
      alignItems: "flex-end",
    },
  });
