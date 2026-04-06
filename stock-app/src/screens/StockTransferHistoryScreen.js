import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";

import AppLayout from "../components/layout/AppLayout";
import stockTransferApi from "../api/stockTransferApi";
import dashboardApi from "../api/dashboardApi";
import StockCard from "../components/ui/StockCard";

export default function StockTransferHistoryScreen() {
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
      console.error("Error fetching stock transfer quantities:", error);
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
            />
            <StockCard
              title="Copper"
              value={transferredStockQuantities.copper?.quantity}
            />
            <StockCard
              title="Scrap"
              value={transferredStockQuantities.scrap?.quantity}
            />
          </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, filterMode === "month" && styles.filterPillActive]}
            onPress={() => setFilterMode("month")}
          >
            <Text style={[styles.filterPillText, filterMode === "month" && styles.filterPillTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, filterMode === "range" && styles.filterPillActive]}
            onPress={() => setFilterMode("range")}
          >
            <Text style={[styles.filterPillText, filterMode === "range" && styles.filterPillTextActive]}>
              Date range
            </Text>
          </TouchableOpacity>
        </View>

        {filterMode === "month" ? (
          <View style={styles.filterControls}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Month</Text>
              <Dropdown
                style={styles.dropdown}
                data={[
                  { label: "Jan", value: "1" },
                  { label: "Feb", value: "2" },
                  { label: "Mar", value: "3" },
                  { label: "Apr", value: "4" },
                  { label: "May", value: "5" },
                  { label: "Jun", value: "6" },
                  { label: "Jul", value: "7" },
                  { label: "Aug", value: "8" },
                  { label: "Sep", value: "9" },
                  { label: "Oct", value: "10" },
                  { label: "Nov", value: "11" },
                  { label: "Dec", value: "12" },
                ]}
                labelField="label"
                valueField="value"
                value={month}
                placeholder="Select month"
                onChange={(item) => setMonth(item.value)}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ width: 120 }}>
              <Text style={styles.label}>Year</Text>
              <Dropdown
                  style={styles.dropdown}
                  data={[
                    { label: "2025", value: "2025" },
                    { label: "2026", value: "2026" },
                    { label: "2027", value: "2027" },
                  ]}
                  labelField="label"
                  valueField="value"
                  value={year}
                  placeholder="Select year"
                  onChange={(item) => setYear(item.value)}
                />
            </View>
          </View>
        ) : (
          <View style={styles.filterControls}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start date</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End date</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
        )}

        {loading ? <Text style={styles.muted}>Loading…</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && records.length === 0 ? (
           <View style={styles.emptyContainer}>
           <Text style={styles.emptyIcon}>📦</Text>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  container: { padding: 15 },
  title: { fontSize: 18, fontWeight: "800" },
  filterRow: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 8 },
  filterPill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#eef2ff" },
  filterPillActive: { backgroundColor: "#2563eb" },
  filterPillText: { color: "#1f2937", fontWeight: "700" },
  filterPillTextActive: { color: "#fff" },
  filterControls: { flexDirection: "row", alignItems: "flex-end", marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "700", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 44,
    backgroundColor: "#fff",
  },
  card: { padding: 14, backgroundColor: "#fff", borderRadius: 12, marginBottom: 10, elevation: 2 },
  cardTitle: { fontWeight: "800", marginBottom: 4 },
  cardLine: { color: "#374151" },
  muted: { color: "#6b7280" },
  error: { color: "#b91c1c", fontWeight: "700" },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
});

