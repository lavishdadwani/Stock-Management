// src/components/layout/AppDrawer.js
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { shadow } from "../../constants/shadow";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useTheme } from "../../context/ThemeContext";

export default function AppDrawer({ visible, onClose, onLogout, user, onNavigate }) {
  const { colors, scheme, setMode } = useTheme();
  const styles = getStyles(colors);
  const pathname = usePathname();

  if (!visible) return null;

  const name = user?.name || "—";
  const email = user?.email || "—";
  const isDark = scheme === "dark";

  const isActive = (path) => pathname === path;
  const linkColor = (path) => (isActive(path) ? colors.primary : colors.text);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />

      <View style={styles.drawer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.navRow} onPress={() => onNavigate?.("/stock-transfer-history")}>
          <Ionicons name="swap-horizontal-outline" size={20} color={linkColor("/stock-transfer-history")} />
          <Text style={[styles.link, { color: linkColor("/stock-transfer-history") }]}>
            Stock Transfer History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navRow} onPress={() => onNavigate?.("/attendance-history")}>
          <Ionicons name="calendar-outline" size={20} color={linkColor("/attendance-history")} />
          <Text style={[styles.link, { color: linkColor("/attendance-history") }]}>
            Attendance History
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={[styles.navRow, styles.themeRow]}>
          <View style={styles.navRowLeft}>
            <Ionicons name="moon-outline" size={20} color={colors.text} />
            <Text style={styles.link}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(next) => setMode(next ? "dark" : "light")}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.navRow} onPress={() => onLogout()}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      flexDirection: "row",
      zIndex: 999,
      elevation: 12,
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    drawer: {
      width: 260,
      backgroundColor: colors.surface,
      padding: spacing.xl,
      ...shadow(13),
    },
    name: {
      ...typography.h2,
      color: colors.text,
    },
    email: {
      ...typography.body,
      color: colors.textMuted,
      marginBottom: spacing.xl,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.sm + 2,
    },
    navRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm + 2,
      paddingVertical: spacing.md,
    },
    navRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm + 2,
    },
    themeRow: {
      justifyContent: "space-between",
      paddingVertical: spacing.xs,
    },
    link: {
      ...typography.bodyBold,
      color: colors.text,
    },
    logout: {
      ...typography.bodyBold,
      color: colors.danger,
    },
  });
