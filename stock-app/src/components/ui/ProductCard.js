// src/components/ui/ProductCard.js
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { shadow } from "../../constants/shadow";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useTheme } from "../../context/ThemeContext";

export default function ProductCard({ item }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const hasBreakdown =
    typeof item.producedQuantity === "number" || typeof item.purchasedQuantity === "number";

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.qty}>
          {item.quantity} {item.unit}
        </Text>
      </View>

      {hasBreakdown ? (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="construct-outline" size={14} color={colors.textMuted} />
            <Text style={styles.statText}>Produced {item.producedQuantity ?? 0}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="cart-outline" size={14} color={colors.textMuted} />
            <Text style={styles.statText}>Purchased {item.purchasedQuantity ?? 0}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    card: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      marginVertical: spacing.xs,
      ...shadow(2),
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    name: { ...typography.bodyBold, color: colors.text },
    qty: { ...typography.bodyBold, color: colors.primary },
    statsRow: {
      flexDirection: "row",
      gap: spacing.lg,
      marginTop: spacing.sm,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    statText: { ...typography.caption, color: colors.textMuted },
  });
