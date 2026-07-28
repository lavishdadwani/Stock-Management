import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import AppLayout from "../components/layout/AppLayout";
import DateRangeFilter from "../components/filters/DateRangeFilter";
import StockCard from "../components/ui/StockCard";
import ProductCard from "../components/ui/ProductCard";

import { getToken } from "../utils/storage";
import attendanceApi from "../api/attendanceApi";
import CheckOutModal from "../components/CheckOutModal";
import dashboardApi, { getCityName } from "../api/dashboardApi";
import * as ImageManipulator from "expo-image-manipulator";
import { shadow } from "../constants/shadow";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useTheme } from "../context/ThemeContext";

/**
 * Build the check-in payload: photo (data URL, required) + GPS (optional -
 * silently omitted from the payload if permission is denied, but the user
 * is notified either way so a missing location is never a silent surprise).
 */
async function buildCheckInPayload() {
  const payload = {};

  const camPerm = await ImagePicker.requestCameraPermissionsAsync();
  if (!camPerm.granted) {
    Alert.alert("Permission Required", "Camera permission is required");
    return null;
  }
  try {
    const image = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.5,
      cameraType: ImagePicker.CameraType.front,
    });

    // ❌ USER DID NOT TAKE PHOTO
    if (image.canceled || !image.assets?.[0]) {
      Alert.alert("Required", "Please capture your photo to complete check-in");
      return null;
    }

    const asset = image.assets[0];

    const manipulated = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 720, height: 960 } }],
      {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    payload.checkInPhoto = `data:image/jpeg;base64,${manipulated.base64}`;
  } catch (e) {
    if (__DEV__) console.warn("Camera check-in:", e?.message || e);
    Alert.alert("Error", "Failed to capture image");
    return null;
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
      if (__DEV__) console.warn("Location check-in:", e?.message || e);
      Alert.alert(
        "Location unavailable",
        "Checking in without a location - we couldn't get your current position."
      );
    }
  } else {
    Alert.alert(
      "Location not shared",
      "Checking in without a location since location permission wasn't granted."
    );
  }

  if (payload.lat != null && payload.lng != null) {
    try {
      const result = await getCityName(payload.lat, payload.lng);
      if (result?.results?.length > 0) {
        payload.city = result.results[0].city;
        payload.address =
          result.results[0].address_line2 || result.results[0].address_line1;
      }
    } catch (e) {
      if (__DEV__) console.warn("Geocoding check-in:", e?.message || e);
    }
  }

  return payload;
}

export default function Dashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

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

  const syncCheckInStatus = useCallback(async () => {
    try {
      const res = await attendanceApi.getCheckInStatus();
      if (res.ok && res.data?.data) {
        setIsCheckedIn(!!res.data.data.isCheckedIn);
      }
    } catch (e) {
      if (__DEV__) console.warn("check-in status:", e?.message || e);
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
      if (__DEV__) console.error("Error fetching stock transfer quantities:", error);
      Alert.alert("Error", "Failed to load stock quantities. Pull to refresh or try again.");
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
      if (__DEV__) console.error("Error fetching item produced:", error);
      Alert.alert("Error", "Failed to load products. Please try again.");
    }
  };

  useEffect(() => {
    fetchItemProduced();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFilterMode, selectedMonth, selectedYear, startDate, endDate]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const payload = await buildCheckInPayload();
      if (!payload) return; // stop if validation failed
      const res = await attendanceApi.checkIn(payload);

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

      const locPerm = await Location.requestForegroundPermissionsAsync();
      if (!locPerm.granted) {
        Alert.alert(
          "Permission Required",
          "Location permission is required to check out."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

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

          <Text style={styles.section}>Products</Text>

          <DateRangeFilter
            mode={productFilterMode}
            onModeChange={setProductFilterMode}
            modes={[
              { value: "all", label: "All" },
              { value: "month", label: "Monthly" },
              { value: "range", label: "Date range" },
            ]}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            year={selectedYear}
            onYearChange={setSelectedYear}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
          />

          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
              <Text style={styles.emptyText}>No products available yet</Text>
            </View>
          ) : (
            products.map((item, index) => (
              <ProductCard key={item._id || index} item={item} />
            ))
          )}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.fab,
            isCheckedIn && { backgroundColor: colors.danger },
            (checkInLoading || checkOutLoading) && styles.fabDisabled,
          ]}
          disabled={checkInLoading || checkOutLoading}
          onPress={() => {
            if (isCheckedIn) {
              setShowCheckout(true);
            } else {
              handleCheckIn();
            }
          }}
        >
          <Ionicons
            name={isCheckedIn ? "log-out-outline" : "log-in-outline"}
            size={18}
            color="#fff"
          />
          <Text style={styles.fabText}>
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

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      padding: spacing.lg,
      paddingBottom: spacing.xxxl + 56, // clears the floating FAB
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    section: {
      ...typography.h2,
      marginTop: spacing.xl,
      color: colors.text,
    },
    fab: {
      position: "absolute",
      bottom: spacing.xl,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 30,
      ...shadow(6),
    },
    fabDisabled: {
      opacity: 0.7,
    },
    fabText: {
      ...typography.bodyBold,
      color: "#fff",
    },
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
