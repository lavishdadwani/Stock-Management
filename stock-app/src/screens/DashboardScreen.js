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
        const addressText = result.results[0].address_line2 || result.results[0].address_line1;
        payload.city = cityName
        payload.address = addressText
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
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) router.replace("/login");
    };

    checkAuth();
    fetchStockTransferQuantities();
    fetchItemProduced();
    syncCheckInStatus();
  }, [syncCheckInStatus]);

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
      const response = await dashboardApi.getItemProduced();

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
          res.data?.displayMessage ||
            res.data?.message ||
            "Check-in failed"
        );
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err?.message || "Check-in failed"
      );
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

          {products.map((item, index) => (
            <ProductCard key={item._id || index} item={item} />
          ))}
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
  fab: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 30,
  },
});
