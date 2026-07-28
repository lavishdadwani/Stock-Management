// src/components/ui/StockCard.js
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadow } from "../../constants/shadow";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useTheme } from "../../context/ThemeContext";

export default function StockCard({ title, value, unit, icon = "cube-outline", accentColor }) {
  const { colors } = useTheme();
  const tint = accentColor || colors.primary;
  const styles = getStyles(colors);
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: colors.filterPillBackground }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>
        {value ?? 0}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    card: {
      width: "30%",
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 10,
      ...shadow(3),
      alignItems: "center",
    },
    iconWrap: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xs,
    },
    title: { ...typography.caption, color: colors.textMuted },
    value: { ...typography.h2, marginTop: spacing.xs, color: colors.text },
    unit: { ...typography.caption, fontWeight: "600", color: colors.textMuted },
  });
