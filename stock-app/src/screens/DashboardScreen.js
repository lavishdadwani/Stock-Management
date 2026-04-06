import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Dropdown } from "react-native-element-dropdown";

import AppLayout from "../components/layout/AppLayout";
import StockCard from "../components/ui/StockCard";
import ProductCard from "../components/ui/ProductCard";

import { getToken } from "../utils/storage";
import attendanceApi from "../api/attendanceApi";
import CheckOutModal from "../components/CheckOutModal";
import dashboardApi from "../api/dashboardApi";

/** Build optional check-in payload: photo (data URL), GPS. Omits missing parts. */
async function buildOptionalCheckInPayload() {
  const payload = {};

  const camPerm = await ImagePicker.requestCameraPermissionsAsync();
  if (camPerm.granted) {
    try {
      const image = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });
      if (!image.canceled && image.assets?.[0]) {
        const asset = image.assets[0];
        if (asset.base64) {
          const mime = asset.mimeType || "image/jpeg";
          payload.checkInPhoto = `data:${mime};base64,${asset.base64}`;
        }
      }
    } catch (e) {
      console.warn("Camera check-in:", e?.message || e);
    }
  }

  const locPerm = await Location.requestForegroundPermissionsAsync();
  if (locPerm.granted) {
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      payload.lat = pos.coords.latitude;
      payload.lng = pos.coords.longitude;
    } catch (e) {
      console.warn("Location check-in:", e?.message || e);
    }
  }
  const result = await dashboardApi.getCityName(payload.lat, payload.lng);
  if (result && result.results && result.results.length > 0) {
    const cityName = result.results[0].city;
    const addressText =
      result.results[0].address_line2 || result.results[0].address_line1;
    payload.city = cityName;
    payload.address = addressText;
  }

  return payload;
}

export default function Dashboard() {
  const router = useRouter();

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  const [transferredStockQuantities, setTransferredStockQuantities] = useState({
    aluminium: { name: "Aluminium", quantity: 0, unit: "kg" },
    copper: { name: "Copper", quantity: 0, unit: "kg" },
    scrap: { name: "Scrap", quantity: 0, unit: "kg" },
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [products, setProducts] = useState([]);
  const [productFilterMode, setProductFilterMode] = useState("all"); // all | month | range
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear())
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const monthOptions = useMemo(
    () => [
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
    ],
    []
  );

  const syncCheckInStatus = useCallback(async () => {
    try {
      const res = await attendanceApi.getCheckInStatus();
      if (res.ok && res.data?.data) {
        setIsCheckedIn(!!res.data.data.isCheckedIn);
      }
    } catch (e) {
      console.warn("check-in status:", e?.message || e);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      fetchStockTransferQuantities();
      fetchItemProduced();
      syncCheckInStatus();
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncCheckInStatus, router]);

  const fetchStockTransferQuantities = async () => {
    try {
      const response = await dashboardApi.getStockTransferQuantities();

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

  const fetchItemProduced = async () => {
    try {
      const params = {};
      if (productFilterMode === "month") {
        params.month = selectedMonth;
        params.year = selectedYear;
      } else if (productFilterMode === "range") {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const response = await dashboardApi.getItemProduced(params);

      if (response.ok) {
        setProducts(response.data.data || []);
      } else {
        Alert.alert(
          "Error",
          response.data?.displayMessage ||
            response.data?.message ||
            "Failed to fetch finished stock totals"
        );
      }
    } catch (error) {
      console.error("Error fetching item produced:", error);
    }
  };

  useEffect(() => {
    fetchItemProduced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFilterMode, selectedMonth, selectedYear, startDate, endDate]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const optional = await buildOptionalCheckInPayload();
      const res = await attendanceApi.checkIn(optional);

      if (res.ok) {
        setIsCheckedIn(true);
        const msg =
          res.data?.displayMessage ||
          res.data?.message ||
          "Checked in successfully";
        Alert.alert("Success", msg);
      } else {
        Alert.alert(
          "Error",
          res.data?.displayMessage || res.data?.message || "Check-in failed"
        );
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Check-in failed");
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async (form) => {
    try {
      setCheckOutLoading(true);
      const location = await Location.getCurrentPositionAsync({});

      const payload = {
        ...form,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      const res = await attendanceApi.checkOut(payload);

      if (res.ok) {
        Alert.alert(
          "Success",
          res.data?.displayMessage || res.data?.message || "Checked out"
        );

        setIsCheckedIn(false);
        setShowCheckout(false);
      } else {
        Alert.alert(
          "Error",
          res.data?.displayMessage || res.data?.message || "Check-out failed"
        );
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Check-out failed");
    } finally {
      setCheckOutLoading(false);
    }
  };

  return (
    <AppLayout>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
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

          <Text style={styles.section}>Products</Text>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterPill,
                productFilterMode === "all" && styles.filterPillActive,
              ]}
              onPress={() => setProductFilterMode("all")}
            >
              <Text
                style={[
                  styles.filterPillText,
                  productFilterMode === "all" && styles.filterPillTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterPill,
                productFilterMode === "month" && styles.filterPillActive,
              ]}
              onPress={() => setProductFilterMode("month")}
            >
              <Text
                style={[
                  styles.filterPillText,
                  productFilterMode === "month" && styles.filterPillTextActive,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterPill,
                productFilterMode === "range" && styles.filterPillActive,
              ]}
              onPress={() => setProductFilterMode("range")}
            >
              <Text
                style={[
                  styles.filterPillText,
                  productFilterMode === "range" && styles.filterPillTextActive,
                ]}
              >
                Date range
              </Text>
            </TouchableOpacity>
          </View>

          {productFilterMode === "month" ? (
            <View style={styles.filterControls}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterLabel}>Month</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={monthOptions}
                  labelField="label"
                  valueField="value"
                  value={selectedMonth}
                  placeholder="Select month"
                  onChange={(item) => setSelectedMonth(item.value)}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ width: 120 }}>
                <Text style={styles.filterLabel}>Year</Text>
                <Dropdown
                  style={styles.dropdown}
                  data={[
                    { label: "2025", value: "2025" },
                    { label: "2026", value: "2026" },
                    { label: "2027", value: "2027" },
                  ]}
                  labelField="label"
                  valueField="value"
                  value={selectedYear}
                  placeholder="Select year"
                  onChange={(item) => setSelectedYear(item.value)}
                />
              </View>
            </View>
          ) : null}

          {productFilterMode === "range" ? (
            <View style={styles.filterControls}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterLabel}>Start date</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.filterLabel}>End date</Text>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
          ) : null}

          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>No products available yet</Text>
            </View>
          ) : (
            products.map((item, index) => (
              <ProductCard key={item._id || index} item={item} />
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.fab, isCheckedIn && { backgroundColor: "red" }]}
          disabled={checkInLoading || checkOutLoading}
          onPress={() => {
            if (isCheckedIn) {
              setShowCheckout(true);
            } else {
              handleCheckIn();
            }
          }}
        >
          <Text style={{ color: "#fff" }}>
            {checkInLoading
              ? "Checking IN..."
              : checkOutLoading
              ? "Processing..."
              : isCheckedIn
              ? "Check OUT"
              : "Check IN"}
          </Text>
        </TouchableOpacity>
        <CheckOutModal
          visible={showCheckout}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleCheckOut}
        />
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 16,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
  },
  filterPillActive: {
    backgroundColor: "#2563eb",
  },
  filterPillText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: "#fff",
  },
  filterControls: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
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
  fab: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 30,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
});
