import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import AppLayout from "../components/layout/AppLayout";
import DateRangeFilter from "../components/filters/DateRangeFilter";
import stockTransferApi from "../api/stockTransferApi";
import dashboardApi from "../api/dashboardApi";
import StockCard from "../components/ui/StockCard";
import { shadow } from "../constants/shadow";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useTheme } from "../context/ThemeContext";

export default function StockTransferHistoryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [transferredStockQuantities, setTransferredStockQuantities] = useState({
    aluminium: { name: "Aluminium", quantity: 0, unit: "kg" },
    copper: { name: "Copper", quantity: 0, unit: "kg" },
    scrap: { name: "Scrap", quantity: 0, unit: "kg" },
  });
  const [filterMode, setFilterMode] = useState("month"); // month | range
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page: 1, limit: 50 };
      if (filterMode === "month") {
        params.month = month;
        params.year = year;
      } else {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const res = await stockTransferApi.getMyTransfers(params);
      if (!res.ok) {
        setError(res.data?.message || "Failed to fetch stock transfer history");
        setRecords([]);
        return;
      }
      setRecords(res.data?.data || []);
    } catch (e) {
      setError(e?.message || "Failed to fetch stock transfer history");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchStockTransferQuantities = async () => {
    try {
      const params = {};
      if (filterMode === "month") {
        params.month = month;
        params.year = year;
      } else {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      const response = await dashboardApi.getStockTransferQuantities(params);

      if (response.ok) {
        setTransferredStockQuantities(response.data.data);
      } else {
        Alert.alert(
          "Error",
          response.data?.displayMessage ||
            response.data?.message ||
            "Failed to fetch stock transfer quantity"
        );
      }
    } catch (error) {
      if (__DEV__) console.error("Error fetching stock transfer quantities:", error);
    }
  };
  useEffect(() => {
    fetchHistory();
    fetchStockTransferQuantities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, month, year, startDate, endDate]);

  return (
    <AppLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Stock Transfer History</Text>

        <View style={styles.row}>
            <StockCard
              title="Aluminium"
              value={transferredStockQuantities.aluminium?.quantity}
              unit={transferredStockQuantities.aluminium?.unit}
              icon="layers-outline"
              accentColor={colors.primary}
            />
            <StockCard
              title="Copper"
              value={transferredStockQuantities.copper?.quantity}
              unit={transferredStockQuantities.copper?.unit}
              icon="flash-outline"
              accentColor={colors.warning}
            />
            <StockCard
              title="Scrap"
              value={transferredStockQuantities.scrap?.quantity}
              unit={transferredStockQuantities.scrap?.unit}
              icon="trash-outline"
              accentColor={colors.textMuted}
            />
          </View>

        <DateRangeFilter
          mode={filterMode}
          onModeChange={setFilterMode}
          month={month}
          onMonthChange={setMonth}
          year={year}
          onYearChange={setYear}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />

        {loading ? <Text style={styles.muted}>Loading…</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No transfers found.</Text>
          </View>
        ) : null}

        {records.map((t) => (
          <View key={t._id} style={styles.card}>
            <Text style={styles.cardTitle}>{t.itemName.toUpperCase()}</Text>
            <Text style={styles.cardLine}>
              Qty: {t.quantity} {t.unit}
            </Text>
            <Text style={styles.cardLine}>From: {t.fromUserId?.name || "—"}</Text>
            <Text style={styles.cardLine}>Date: {t.transferDate ? String(t.transferDate).slice(0, 10) : "—"}</Text>
          </View>
        ))}
      </ScrollView>
    </AppLayout>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    container: { padding: spacing.lg },
    title: { ...typography.h2, marginBottom: spacing.md, color: colors.text },
    card: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: 12, marginBottom: spacing.sm, ...shadow(2) },
    cardTitle: { ...typography.bodyBold, marginBottom: spacing.xs, color: colors.text },
    cardLine: { ...typography.body, color: colors.textSecondary },
    muted: { ...typography.body, color: colors.textMuted },
    error: { ...typography.bodyBold, color: colors.danger },
    emptyContainer: {
      alignItems: "center",
      marginTop: spacing.xxxl,
    },
    emptyText: {
      ...typography.body,
      marginTop: spacing.sm,
      color: colors.textMuted,
    },
  });
