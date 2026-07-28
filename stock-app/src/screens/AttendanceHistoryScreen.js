import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState } from "react";

import AppLayout from "../components/layout/AppLayout";
import DateRangeFilter from "../components/filters/DateRangeFilter";
import attendanceApi from "../api/attendanceApi";
import { Ionicons } from "@expo/vector-icons";
import { shadow } from "../constants/shadow";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useTheme } from "../context/ThemeContext";

export default function AttendanceHistoryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);

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

      const res = await attendanceApi.getMyAttendanceHistory(params);
      if (!res.ok) {
        setError(res.data?.message || "Failed to fetch attendance history");
        setRecords([]);
        return;
      }
      setRecords(res.data?.data || []);
    } catch (e) {
      setError(e?.message || "Failed to fetch attendance history");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, month, year, startDate, endDate]);

  return (
    <AppLayout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Attendance History</Text>

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
            <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
            <Text style={styles.muted}>No attendance records found.</Text>
          </View>
        ) : null}

        {records.map((record) => (
          <View key={record._id} style={styles.card}>
            <View style={styles.badge}>
              <View
                style={[
                  styles.badgeDot,
                  { backgroundColor: record.status === "checked-in" ? colors.success : colors.textMuted },
                ]}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: record.status === "checked-in" ? colors.success : colors.textMuted },
                ]}
              >
                {record.status === "checked-in"
                  ? "Checked-in"
                  : record.status === "checked-out"
                  ? "Checked-out"
                  : record.status}
              </Text>
            </View>
            <Text style={styles.cardLine}>
              In:{" "}
              {record.checkInTime
                ? String(record.checkInTime).slice(0, 19).replace("T", " ")
                : "—"}
            </Text>
            <Text style={styles.cardLine}>
              Out:{" "}
              {record.checkOutTime
                ? String(record.checkOutTime).slice(0, 19).replace("T", " ")
                : "—"}
            </Text>
            <Text style={styles.name}>{record.itemId?.itemName}</Text>
            <Text style={styles.cardLine}>
              Qty: {record.itemId?.quantity} {record.itemId?.unit}
            </Text>
            {record.itemId?.scrapQuantity ? (
              <Text style={styles.cardLine}>Scrap: {record.itemId?.scrapQuantity} kg</Text>
            ) : null}
            {record.itemId?.wireUsedType && record.itemId?.wireUsedQuantity ? (
              <Text style={styles.cardLine}>
                Wire Used Type: {record.itemId?.wireUsedType.toUpperCase()}, Qty:{" "}
                {record.itemId?.wireUsedQuantity} kg
              </Text>
            ) : null}
            {record.itemId?.description ? (
              <Text style={styles.cardLine}>Description: {record.itemId?.description}</Text>
            ) : null}
            {typeof record.itemId?.producedQuantity === "number" ||
            typeof record.itemId?.purchasedQuantity === "number" ? (
              <Text style={styles.cardLine}>
                Produced: {record.itemId?.producedQuantity ?? 0} | Purchased:{" "}
                {record.itemId?.purchasedQuantity ?? 0}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </AppLayout>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: { padding: spacing.lg },
    title: { ...typography.h2, marginBottom: spacing.md, color: colors.text },
    card: {
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: spacing.sm,
      ...shadow(2),
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: spacing.xs,
      backgroundColor: colors.filterPillBackground,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm + 2,
      borderRadius: 999,
      marginBottom: spacing.sm,
    },
    badgeDot: { width: 6, height: 6, borderRadius: 3 },
    badgeText: { ...typography.label },
    cardLine: { ...typography.body, color: colors.textSecondary },
    name: { ...typography.bodyBold, color: colors.text },
    muted: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
    error: { ...typography.bodyBold, color: colors.danger },
    emptyContainer: {
      alignItems: "center",
      marginTop: spacing.xxxl,
    },
  });
